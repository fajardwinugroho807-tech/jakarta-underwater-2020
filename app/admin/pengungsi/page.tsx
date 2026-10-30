
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import {
  ArrowLeft,
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
  Download,
} from "lucide-react";

type Evacuee = {
  id: number;
  full_name: string;
  origin_area: string | null;
  age: number | null;
  shelter_id: number | null;
};

type Shelter = {
  id: number;
  shelter_name: string;
  capacity: number | null;
  occupied: number;
  remaining: number;
};

type ShelterAvailability = {
  id: number;
  shelter_name: string;
  capacity: number | null;
  occupied: number;
  remaining: number;
};

type FormData = {
  full_name: string;
  origin_area: string;
  age: string;
  shelter_id: string;
};

const emptyForm: FormData = {
  full_name: "",
  origin_area: "",
  age: "",
  shelter_id: "",
};

export default function AdminPengungsiPage() {
  const router = useRouter();

  const [evacuees, setEvacuees] = useState<Evacuee[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [search, setSearch] = useState("");
  const [selectedShelter, setSelectedShelter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

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

      const [evacueeResult, shelterResult] = await Promise.all([
        supabase
          .from("evacuees")
          .select("id, full_name, origin_area, age, shelter_id")
          .order("id", { ascending: true }),
        supabase.rpc("available_evacuation_shelters"),
      ]);

      if (!active) return;

      if (evacueeResult.error || shelterResult.error) {
        setError(evacueeResult.error?.message || shelterResult.error?.message || "Gagal memuat data.");
      } else {
        setEvacuees(evacueeResult.data ?? []);
        setShelters((shelterResult.data ?? []).map((s: ShelterAvailability) => ({
         id: Number(s.id), shelter_name: s.shelter_name,
         capacity: s.capacity, occupied: Number(s.occupied), remaining: Number(s.remaining),
       })));
      }

      setLoading(false);
    }

    initialize();

    return () => {
      active = false;
    };
  }, [router]);

  async function loadEvacuees() {
    setError("");

    const [evacueeResult, shelterResult] = await Promise.all([
      supabase.from("evacuees")
        .select("id, full_name, origin_area, age, shelter_id")
        .order("id", { ascending: true }),
      supabase.rpc("available_evacuation_shelters"),
    ]);

    if (evacueeResult.error || shelterResult.error) {
      setError(evacueeResult.error?.message || shelterResult.error?.message || "Gagal memuat data.");
      return;
    }

    setEvacuees(evacueeResult.data ?? []);
    setShelters((shelterResult.data ?? []).map((s: ShelterAvailability) => ({
      id: Number(s.id), shelter_name: s.shelter_name,
      capacity: s.capacity, occupied: Number(s.occupied), remaining: Number(s.remaining),
    })));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(person: Evacuee) {
    setEditingId(person.id);
    setForm({
      full_name: person.full_name,
      origin_area: person.origin_area ?? "",
      age: person.age?.toString() ?? "",
      shelter_id: person.shelter_id?.toString() ?? "",
    });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!authorized || saving) return;

    setError("");
    setMessage("");

    const name = form.full_name.trim();
    const area = form.origin_area.trim();

    if (!name) {
      setError("Nama pengungsi wajib diisi.");
      return;
    }

    const age = form.age.trim()
      ? Number(form.age)
      : null;

    if (
      age !== null &&
      (!Number.isInteger(age) || age < 0 || age > 120)
    ) {
      setError("Usia harus berupa angka antara 0 dan 120.");
      return;
    }

    const shelterId = form.shelter_id ? Number(form.shelter_id) : null;
    if (shelterId !== null && !shelters.some((shelter) => shelter.id === shelterId)) {
      setError("Posko yang dipilih tidak tersedia.");
      return;
    }

    // Validasi cepat di UI; trigger STEP 62 tetap menjadi pengaman final di database.
    if (shelterId !== null && (editingId === null ||
      evacuees.find((p) => p.id === editingId)?.shelter_id !== shelterId)) {
      const chosen = shelters.find((p) => p.id === shelterId);
      if (chosen && chosen.remaining <= 0) {
        setError("Posko ini sudah penuh. Pilih posko lain.");
        return;
      }
    }

    setSaving(true);

    const payload = {
      full_name: name,
      origin_area: area || null,
      age,
      shelter_id: shelterId,
    };

    const result =
      editingId === null
        ? await supabase.from("evacuees").insert(payload)
        : await supabase
            .from("evacuees")
            .update(payload)
            .eq("id", editingId);

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setMessage(
      editingId === null
        ? "Data pengungsi berhasil ditambahkan."
        : "Data pengungsi berhasil diperbarui."
    );

    await loadEvacuees();
  }

  async function handleDelete(person: Evacuee) {
    if (!authorized) return;

    const confirmed = window.confirm(
      `Yakin ingin menghapus data "${person.full_name}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error: deleteError } =
      await supabase
        .from("evacuees")
        .delete()
        .eq("id", person.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMessage("Data pengungsi berhasil dihapus.");
    await loadEvacuees();
  }

  function getShelterName(shelterId: number | null) {
    if (shelterId === null) return "Belum ditentukan";
    return shelters.find((shelter) => shelter.id === shelterId)?.shelter_name ?? "Posko tidak ditemukan";
  }

  const filtered = evacuees.filter((person) => {
    const keyword = search.trim().toLowerCase();
    const matchesShelter = selectedShelter === "all" ||
      (selectedShelter === "none" ? person.shelter_id === null : person.shelter_id === Number(selectedShelter));

    return matchesShelter && (
      person.full_name.toLowerCase().includes(keyword) ||
      (person.origin_area ?? "").toLowerCase().includes(keyword) ||
      getShelterName(person.shelter_id).toLowerCase().includes(keyword)
    );
  });

  function exportFilteredCSV() {
    if (!authorized || filtered.length === 0) return;

    // Escape CSV dan cegah teks pengguna dieksekusi sebagai formula spreadsheet.
    function csvCell(value: string | number | null | undefined) {
      let cell = String(value ?? "");
      if (/^[\s]*[=+@-]/.test(cell)) cell = "'" + cell;
      return `"${cell.replace(/"/g, '""')}"`;
    }

    const rows: (string | number | null)[][] = [
      ["ID", "Nama Lengkap", "Daerah Asal", "Usia", "Posko Evakuasi"],
      ...filtered.map((person) => [
        person.id,
        person.full_name,
        person.origin_area ?? "",
        person.age,
        getShelterName(person.shelter_id),
      ]),
    ];
    const csv = "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-pengungsi-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage(`Berhasil mengekspor ${filtered.length} data pengungsi sesuai filter.`);
  }

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
        <Link href="/dashboard" className="text-[#a8d9e8] underline">
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
              <Users size={22} />
              <p className="text-xs font-bold uppercase tracking-[0.3em]">
                Administrator / Evacuees
              </p>
            </div>

            <h1 className="mt-5 text-4xl font-black uppercase md:text-6xl">
              DATA
              <br />
              <span className="text-[#a8d9e8]">
                PENGUNGSI.
              </span>
            </h1>

            <p className="mt-5 text-sm text-slate-400">
              Pengelolaan data pengungsi simulasi banjir Jakarta 2020.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 bg-[#a8d9e8] px-5 py-4 text-sm font-bold text-[#080e14] hover:bg-white"
          >
            <Plus size={18} />
            Tambah Pengungsi
          </button>
        </div>

        <section className="mt-12 border border-white/10 bg-[#101c26] p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">
                Total data simulasi
              </p>
              <p className="mt-2 text-3xl font-black text-[#a8d9e8]">
                {evacuees.length}
              </p>
              <p className="mt-2 text-xs text-slate-400">Termasuk pendaftaran otomatis; belum tentu sudah tiba di posko.</p>
            </div>

            <button
              onClick={loadEvacuees}
              className="inline-flex items-center gap-2 border border-white/20 px-4 py-3 text-sm hover:bg-white/5"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="border border-white/10 bg-[#080e14] p-4">
              <p className="text-xs text-slate-400">Total kapasitas posko</p>
              <p className="mt-2 text-2xl font-bold text-[#a8d9e8]">{shelters.reduce((sum, s) => sum + (s.capacity ?? 0), 0)}</p>
            </div>
            <div className="border border-white/10 bg-[#080e14] p-4">
              <p className="text-xs text-slate-400">Tempat tercatat terisi</p>
              <p className="mt-2 text-2xl font-bold text-[#a8d9e8]">{shelters.reduce((sum, s) => sum + s.occupied, 0)}</p>
            </div>
            <div className="border border-white/10 bg-[#080e14] p-4">
              <p className="text-xs text-slate-400">Sisa tempat</p>
              <p className="mt-2 text-2xl font-bold text-[#a8d9e8]">{shelters.reduce((sum, s) => sum + s.remaining, 0)}</p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 border border-white/15 bg-[#080e14] px-4">
            <Search size={18} className="text-[#a8d9e8]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, daerah asal, atau posko..."
              className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label htmlFor="filter-posko" className="text-sm text-slate-300">
              Filter berdasarkan posko:
            </label>
            <select
              id="filter-posko"
              value={selectedShelter}
              onChange={(e) => setSelectedShelter(e.target.value)}
              className="min-w-[220px] flex-1 border border-white/15 bg-[#080e14] px-4 py-3 text-sm text-white outline-none focus:border-[#a8d9e8]"
            >
              <option value="all">Semua Posko</option>
              <option value="none">Belum Ditentukan</option>
              {shelters.map((shelter) => (
                <option key={shelter.id} value={shelter.id}>
                  {shelter.shelter_name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => { setSearch(""); setSelectedShelter("all"); }}
              className="border border-white/20 px-4 py-3 text-sm hover:bg-white/5"
            >
              Reset Filter
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-400" role="status">
              Menampilkan {filtered.length} dari {evacuees.length} pengungsi
            </p>
            <button
              type="button"
              onClick={exportFilteredCSV}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-2 border border-[#a8d9e8]/40 bg-[#a8d9e8]/10 px-4 py-3 text-sm font-bold text-[#a8d9e8] transition hover:bg-[#a8d9e8]/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download size={17} />
              Export CSV ({filtered.length})
            </button>
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
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-white/15 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-4">ID</th>
                  <th className="px-4 py-4">Nama</th>
                  <th className="px-4 py-4">Daerah Asal</th>
                  <th className="px-4 py-4">Usia</th>
                  <th className="px-4 py-4">Posko Evakuasi</th>
                  <th className="px-4 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((person) => (
                  <tr
                    key={person.id}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="px-4 py-5 text-slate-400">
                      #{person.id}
                    </td>

                    <td className="px-4 py-5 font-semibold">
                      {person.full_name}
                    </td>

                    <td className="px-4 py-5 text-slate-300">
                      {person.origin_area || "-"}
                    </td>

                    <td className="px-4 py-5 text-slate-300">
                      {person.age ?? "-"}
                    </td>

                    <td className="px-4 py-5 text-slate-300">
                      {getShelterName(person.shelter_id)}
                    </td>

                    <td className="px-4 py-5">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditForm(person)}
                          className="rounded border border-[#a8d9e8]/30 p-2 text-[#a8d9e8] hover:bg-[#a8d9e8]/10"
                          title="Edit"
                          aria-label={`Edit ${person.full_name}`}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(person)}
                          className="rounded border border-red-400/30 p-2 text-red-300 hover:bg-red-400/10"
                          title="Hapus"
                          aria-label={`Hapus ${person.full_name}`}
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
                Tidak ada data pengungsi yang ditemukan.
              </p>
            )}
          </div>
        </section>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="evacuee-form-title"
              className="w-full max-w-lg border border-white/15 bg-[#101c26] p-6 md:p-9"
            >
              <div className="flex items-center justify-between gap-4">
                <h2
                  id="evacuee-form-title"
                  className="text-2xl font-black uppercase"
                >
                  {editingId === null
                    ? "Tambah Pengungsi"
                    : "Edit Pengungsi"}
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
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        full_name: e.target.value,
                      })
                    }
                    className="w-full border border-white/15 bg-[#080e14] px-4 py-3 outline-none focus:border-[#a8d9e8]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Daerah Asal
                  </label>
                  <input
                    type="text"
                    maxLength={120}
                    value={form.origin_area}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        origin_area: e.target.value,
                      })
                    }
                    className="w-full border border-white/15 bg-[#080e14] px-4 py-3 outline-none focus:border-[#a8d9e8]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Usia
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={form.age}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        age: e.target.value,
                      })
                    }
                    className="w-full border border-white/15 bg-[#080e14] px-4 py-3 outline-none focus:border-[#a8d9e8]"
                  />
                </div>

                <div>
                  <label htmlFor="shelter-id" className="mb-2 block text-sm text-slate-300">
                    Posko Evakuasi
                  </label>
                  <select
                    id="shelter-id"
                    value={form.shelter_id}
                    onChange={(e) => setForm({ ...form, shelter_id: e.target.value })}
                    className="w-full border border-white/15 bg-[#080e14] px-4 py-3 text-white outline-none focus:border-[#a8d9e8]"
                  >
                    <option value="">Belum ditentukan</option>
                    {shelters.map((shelter) => (
                      <option key={shelter.id} value={shelter.id}>
                        {shelter.shelter_name} — sisa {shelter.remaining} / {shelter.capacity ?? "?"}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-slate-400">Posko penuh tidak menerima tambahan pengungsi. Pemindahan dan penambahan divalidasi lagi oleh database.</p>
                  {shelters.length === 0 && (
                    <p className="mt-2 text-xs text-amber-300">
                      Belum ada posko. Tambahkan posko melalui menu Posko Evakuasi.
                    </p>
                  )}
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
