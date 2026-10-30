
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import {
  ArrowLeft,
  MapPin,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
  Users,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type Shelter = {
  id: number;
  shelter_name: string;
  address: string | null;
  capacity: number | null;
  location_id: number | null;
  latitude: number | null;
  longitude: number | null;
  occupied?: number;
  remaining?: number;
};

type ShelterForm = {
  shelter_name: string;
  address: string;
  capacity: string;
  location_id: string;
  latitude: string;
  longitude: string;
};

const emptyForm: ShelterForm = {
  shelter_name: "",
  address: "",
  capacity: "",
  location_id: "",
  latitude: "",
  longitude: "",
};

export default function AdminPoskoPage() {
  const router = useRouter();

  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [search, setSearch] = useState("");
  const [capacityLoading, setCapacityLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ShelterForm>(emptyForm);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (!active) return;

      if (authError || !authData.user) {
        router.replace("/login");
        return;
      }

      const { data: admin, error: roleError } =
        await supabase
          .from("admins")
          .select("id")
          .eq("id", authData.user.id)
          .maybeSingle();

      if (!active) return;

      if (roleError) {
        setError(roleError.message);
        setLoading(false);
        return;
      }

      if (!admin) {
        router.replace("/dashboard");
        return;
      }

      setAuthorized(true);

      try {
        const result = await fetchSheltersWithOccupancy();
        if (!active) return;
        setShelters(result);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Gagal memuat data posko.");
      }

      setLoading(false);
    }

    initialize();

    return () => {
      active = false;
    };
  }, [router]);

  async function fetchSheltersWithOccupancy() {
    const { data, error: fetchError } = await supabase
      .from("shelters")
      .select("id, shelter_name, address, capacity, location_id, latitude, longitude")
      .order("id", { ascending: true });
    if (fetchError) throw new Error(fetchError.message);

    const { data: occupancy, error: occupancyError } = await supabase.rpc(
      "available_evacuation_shelters"
    );
    if (occupancyError) throw new Error(occupancyError.message);

    const counts = new Map<number, { occupied: number; remaining: number }>();
    for (const row of occupancy ?? []) {
      counts.set(Number(row.id), {
        occupied: Number(row.occupied ?? 0),
        remaining: Number(row.remaining ?? 0),
      });
    }
    return (data ?? []).map((shelter) => ({
      ...shelter,
      occupied: counts.get(Number(shelter.id))?.occupied ?? 0,
      remaining: counts.get(Number(shelter.id))?.remaining ?? 0,
    })) as Shelter[];
  }

  async function loadShelters() {
    setError("");
    setCapacityLoading(true);
    try {
      setShelters(await fetchSheltersWithOccupancy());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data posko.");
    } finally {
      setCapacityLoading(false);
    }
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(shelter: Shelter) {
    setEditingId(shelter.id);

    setForm({
      shelter_name: shelter.shelter_name,
      address: shelter.address ?? "",
      capacity: shelter.capacity?.toString() ?? "",
      location_id: shelter.location_id?.toString() ?? "",
      latitude: shelter.latitude?.toString() ?? "",
      longitude: shelter.longitude?.toString() ?? "",
    });

    setError("");
    setMessage("");
    setShowForm(true);
  }

  function parseOptionalNumber(value: string) {
    return value.trim() === "" ? null : Number(value);
  }

  async function handleSave(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!authorized || saving) return;

    setError("");
    setMessage("");

    const name = form.shelter_name.trim();

    if (!name) {
      setError("Nama posko wajib diisi.");
      return;
    }

    const capacity = parseOptionalNumber(form.capacity);
    const locationId = parseOptionalNumber(form.location_id);
    const latitude = parseOptionalNumber(form.latitude);
    const longitude = parseOptionalNumber(form.longitude);

    if (
      capacity !== null &&
      (!Number.isInteger(capacity) || capacity < 0)
    ) {
      setError("Kapasitas harus berupa bilangan bulat positif.");
      return;
    }

    if (
      locationId !== null &&
      (!Number.isInteger(locationId) || locationId < 1)
    ) {
      setError("Location ID harus berupa bilangan bulat positif.");
      return;
    }

    if (
      latitude !== null &&
      (!Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90)
    ) {
      setError("Latitude harus berada antara -90 dan 90.");
      return;
    }

    if (
      longitude !== null &&
      (!Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180)
    ) {
      setError("Longitude harus berada antara -180 dan 180.");
      return;
    }

    if (editingId !== null && capacity !== null) {
      const current = shelters.find((s) => s.id === editingId);
      if (current && capacity < (current.occupied ?? 0)) {
        setError(`Kapasitas tidak boleh lebih kecil dari ${current.occupied} pengungsi yang sudah tercatat.`);
        return;
      }
    }

    setSaving(true);

    const payload = {
      shelter_name: name,
      address: form.address.trim() || null,
      capacity,
      location_id: locationId,
      latitude,
      longitude,
    };

    const result =
      editingId === null
        ? await supabase.from("shelters").insert(payload)
        : await supabase
            .from("shelters")
            .update(payload)
            .eq("id", editingId);

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    const wasEditing = editingId !== null;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);

    setMessage(
      wasEditing
        ? "Data posko berhasil diperbarui."
        : "Data posko berhasil ditambahkan."
    );

    await loadShelters();
  }

  async function handleDelete(shelter: Shelter) {
    if (!authorized) return;
    if ((shelter.occupied ?? 0) > 0) {
      setError("Posko masih memiliki pengungsi tercatat. Pindahkan data pengungsi terlebih dahulu.");
      return;
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus posko "${shelter.shelter_name}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error: deleteError } =
      await supabase
        .from("shelters")
        .delete()
        .eq("id", shelter.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMessage("Data posko berhasil dihapus.");
    await loadShelters();
  }

  const totalCapacity = shelters.reduce((n, s) => n + (s.capacity ?? 0), 0);
  const totalOccupied = shelters.reduce((n, s) => n + (s.occupied ?? 0), 0);
  const totalRemaining = shelters.reduce((n, s) => n + (s.remaining ?? 0), 0);

  const filtered = shelters.filter((shelter) => {
    const keyword = search.toLowerCase();

    return (
      shelter.shelter_name.toLowerCase().includes(keyword) ||
      (shelter.address ?? "").toLowerCase().includes(keyword)
    );
  });

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080e14] text-[#a8d9e8]">
        <p className="animate-pulse uppercase tracking-widest">
          Memeriksa akses admin...
        </p>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#080e14] px-6 text-white">
        <h1 className="text-2xl font-bold">
          Akses belum tersedia
        </h1>

        <p className="text-center text-red-300">
          {error || "Akun ini tidak memiliki akses admin."}
        </p>

        <Link
          href="/dashboard"
          className="text-[#a8d9e8] underline"
        >
          Kembali ke Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080e14] px-5 py-12 text-white md:px-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-[#a8d9e8] hover:text-white"
        >
          <ArrowLeft size={18} />
          Kembali ke Dashboard Admin
        </Link>

        <div className="mt-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-[#a8d9e8]">
              <MapPin size={22} />

              <p className="text-xs font-bold uppercase tracking-[0.3em]">
                Administrator / Shelters
              </p>
            </div>

            <h1 className="mt-5 text-4xl font-black uppercase md:text-6xl">
              DATA
              <br />
              <span className="text-[#a8d9e8]">
                POSKO.
              </span>
            </h1>

            <p className="mt-5 text-sm text-slate-400">
              Pengelolaan posko evakuasi simulasi banjir Jakarta 2020.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 bg-[#a8d9e8] px-5 py-4 text-sm font-bold text-[#080e14] hover:bg-white"
          >
            <Plus size={18} />
            Tambah Posko
          </button>
        </div>

        <section className="mt-12 border border-white/10 bg-[#101c26] p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">
                Total posko simulasi
              </p>

              <p className="mt-2 text-3xl font-black text-[#a8d9e8]">
                {shelters.length}
              </p>
            </div>

            <button
              onClick={loadShelters}
              disabled={capacityLoading}
              className="inline-flex items-center gap-2 border border-white/20 px-4 py-3 text-sm hover:bg-white/5"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="border border-white/10 bg-[#080e14] p-4">
              <p className="flex items-center gap-2 text-xs text-slate-400"><Users size={15} /> Total Terisi</p>
              <p className="mt-2 text-2xl font-bold">{totalOccupied}</p>
            </div>
            <div className="border border-white/10 bg-[#080e14] p-4">
              <p className="text-xs text-slate-400">Kapasitas Terdata</p>
              <p className="mt-2 text-2xl font-bold">{totalCapacity}</p>
            </div>
            <div className="border border-white/10 bg-[#080e14] p-4">
              <p className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle2 size={15} /> Sisa Tempat</p>
              <p className="mt-2 text-2xl font-bold text-[#a8d9e8]">{totalRemaining}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Jumlah terisi berdasarkan catatan pengungsi, bukan konfirmasi kehadiran fisik. Posko tanpa kapasitas tidak bisa menerima pendaftaran otomatis.</p>

          <div className="mt-8 flex items-center gap-3 border border-white/15 bg-[#080e14] px-4">
            <Search
              size={18}
              className="text-[#a8d9e8]"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau alamat posko..."
              className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-600"
            />
          </div>

          {error && (
            <p role="alert" className="mt-5 text-sm text-red-300">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="mt-5 text-sm text-[#a8d9e8]">
              {message}
            </p>
          )}

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left text-sm">
              <thead className="border-b border-white/15 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-4">ID</th>
                  <th className="px-4 py-4">Nama Posko</th>
                  <th className="px-4 py-4">Alamat</th>
                  <th className="px-4 py-4">Kapasitas</th>
                  <th className="px-4 py-4">Terisi</th>
                  <th className="px-4 py-4">Sisa</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Location ID</th>
                  <th className="px-4 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((shelter) => (
                  <tr
                    key={shelter.id}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="px-4 py-5 text-slate-400">
                      #{shelter.id}
                    </td>

                    <td className="px-4 py-5 font-semibold">
                      {shelter.shelter_name}
                    </td>

                    <td className="px-4 py-5 text-slate-300">
                      {shelter.address || "-"}
                    </td>

                    <td className="px-4 py-5 text-slate-300">
                      {shelter.capacity ?? "-"}
                    </td>

                    <td className="px-4 py-5 text-slate-300">{shelter.occupied ?? 0}</td>
                    <td className="px-4 py-5 text-[#a8d9e8]">{shelter.capacity == null ? "-" : shelter.remaining ?? 0}</td>
                    <td className="px-4 py-5">
                      {shelter.capacity == null || shelter.capacity <= 0 || (shelter.remaining ?? 0) <= 0 ? (
                        <span className="inline-flex items-center gap-1 text-red-300"><AlertTriangle size={14} /> Penuh / Tidak tersedia</span>
                      ) : (shelter.remaining ?? 0) <= Math.max(2, Math.ceil(shelter.capacity * 0.1)) ? (
                        <span className="text-amber-300">Hampir Penuh</span>
                      ) : (
                        <span className="text-emerald-300">Tersedia</span>
                      )}
                    </td>
                    <td className="px-4 py-5 text-slate-300">
                      {shelter.location_id ?? "-"}
                    </td>

                    <td className="px-4 py-5">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditForm(shelter)}
                          className="rounded border border-[#a8d9e8]/30 p-2 text-[#a8d9e8] hover:bg-[#a8d9e8]/10"
                          title="Edit"
                          aria-label={`Edit ${shelter.shelter_name}`}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(shelter)}
                          className="rounded border border-red-400/30 p-2 text-red-300 hover:bg-red-400/10"
                          title="Hapus"
                          aria-label={`Hapus ${shelter.shelter_name}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <p className="py-12 text-center text-slate-400">
                Tidak ada data posko yang ditemukan.
              </p>
            )}
          </div>
        </section>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="shelter-form-title"
              className="w-full max-w-lg border border-white/15 bg-[#101c26] p-6 md:p-9"
            >
              <div className="flex items-center justify-between gap-4">
                <h2
                  id="shelter-form-title"
                  className="text-2xl font-black uppercase"
                >
                  {editingId === null
                    ? "Tambah Posko"
                    : "Edit Posko"}
                </h2>

                <button
                  onClick={() => setShowForm(false)}
                  aria-label="Tutup formulir"
                  className="text-slate-400 hover:text-white"
                >
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Nama Posko
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={form.shelter_name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        shelter_name: e.target.value,
                      })
                    }
                    className="w-full border border-white/15 bg-[#080e14] px-4 py-3 outline-none focus:border-[#a8d9e8]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Alamat
                  </label>
                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: e.target.value,
                      })
                    }
                    className="w-full resize-none border border-white/15 bg-[#080e14] px-4 py-3 outline-none focus:border-[#a8d9e8]"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Kapasitas
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.capacity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          capacity: e.target.value,
                        })
                      }
                      className="w-full border border-white/15 bg-[#080e14] px-4 py-3 outline-none focus:border-[#a8d9e8]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Location ID
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.location_id}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          location_id: e.target.value,
                        })
                      }
                      className="w-full border border-white/15 bg-[#080e14] px-4 py-3 outline-none focus:border-[#a8d9e8]"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      min={-90}
                      max={90}
                      value={form.latitude}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          latitude: e.target.value,
                        })
                      }
                      className="w-full border border-white/15 bg-[#080e14] px-4 py-3 outline-none focus:border-[#a8d9e8]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      min={-180}
                      max={180}
                      value={form.longitude}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          longitude: e.target.value,
                        })
                      }
                      className="w-full border border-white/15 bg-[#080e14] px-4 py-3 outline-none focus:border-[#a8d9e8]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-3 bg-[#a8d9e8] px-5 py-4 font-bold text-[#080e14] hover:bg-white disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? "Menyimpan..." : "Simpan Data"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
