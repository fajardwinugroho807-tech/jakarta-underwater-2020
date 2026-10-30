
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import {
  ArrowLeft,
  Package,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
} from "lucide-react";

type Distribution = {
  id: number;
  shelter_id: number;
  aid_type_id: number;
  quantity: number;
  distribution_date: string;
  notes: string | null;
};

type Shelter = {
  id: number;
  shelter_name: string;
};

type AidType = {
  id: number;
  aid_name: string;
  unit: string;
};

type FormData = {
  shelter_id: string;
  aid_type_id: string;
  quantity: string;
  distribution_date: string;
  notes: string;
};

const emptyForm: FormData = {
  shelter_id: "",
  aid_type_id: "",
  quantity: "",
  distribution_date: "",
  notes: "",
};

export default function AdminBantuanPage() {
  const router = useRouter();

  const [distributions, setDistributions] =
    useState<Distribution[]>([]);

  const [shelters, setShelters] =
    useState<Shelter[]>([]);

  const [aidTypes, setAidTypes] =
    useState<AidType[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [authorized, setAuthorized] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<FormData>(emptyForm);

  const loadData = useCallback(async () => {
    const [
      distributionResult,
      shelterResult,
      aidTypeResult,
    ] = await Promise.all([
      supabase
        .from("aid_distributions")
        .select(
          "id, shelter_id, aid_type_id, quantity, distribution_date, notes"
        )
        .order("id", { ascending: false }),

      supabase
        .from("shelters")
        .select("id, shelter_name")
        .order("shelter_name"),

      supabase
        .from("aid_types")
        .select("id, aid_name, unit")
        .order("aid_name"),
    ]);

    const firstError =
      distributionResult.error ||
      shelterResult.error ||
      aidTypeResult.error;

    if (firstError) {
      throw new Error(firstError.message);
    }

    setDistributions(distributionResult.data ?? []);
    setShelters(shelterResult.data ?? []);
    setAidTypes(aidTypeResult.data ?? []);
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const { data, error: authError } =
          await supabase.auth.getUser();

        if (!active) return;

        if (authError || !data.user) {
          router.replace("/login");
          return;
        }

        const { data: admin, error: roleError } =
          await supabase
            .from("admins")
            .select("id")
            .eq("id", data.user.id)
            .maybeSingle();

        if (!active) return;

        if (roleError) {
          throw new Error(roleError.message);
        }

        if (!admin) {
          router.replace("/dashboard");
          return;
        }

        setAuthorized(true);
        await loadData();
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal memuat data."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [router, loadData]);

  async function handleRefresh() {
    setError("");
    setMessage("");

    try {
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui data."
      );
    }
  }

  function getShelterName(id: number) {
    return (
      shelters.find((item) => item.id === id)
        ?.shelter_name ?? `Posko #${id}`
    );
  }

  function getAidType(id: number) {
    return aidTypes.find((item) => item.id === id);
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(item: Distribution) {
    setEditingId(item.id);

    setForm({
      shelter_id: String(item.shelter_id),
      aid_type_id: String(item.aid_type_id),
      quantity: String(item.quantity),
      distribution_date: item.distribution_date,
      notes: item.notes ?? "",
    });

    setError("");
    setMessage("");
    setShowForm(true);
  }

  async function handleSave(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!authorized || saving) return;

    setError("");
    setMessage("");

    const shelterId = Number(form.shelter_id);
    const aidTypeId = Number(form.aid_type_id);
    const quantity = Number(form.quantity);

    if (
      !form.shelter_id ||
      !shelters.some((s) => s.id === shelterId)
    ) {
      setError("Pilih posko yang valid.");
      return;
    }

    if (
      !form.aid_type_id ||
      !aidTypes.some((a) => a.id === aidTypeId)
    ) {
      setError("Pilih jenis bantuan yang valid.");
      return;
    }

    if (
      !form.quantity.trim() ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0
    ) {
      setError(
        "Jumlah bantuan harus berupa bilangan bulat lebih dari 0."
      );
      return;
    }

    if (!form.distribution_date) {
      setError("Tanggal distribusi wajib diisi.");
      return;
    }

    const payload = {
      shelter_id: shelterId,
      aid_type_id: aidTypeId,
      quantity,
      distribution_date: form.distribution_date,
      notes: form.notes.trim() || null,
    };

    setSaving(true);

    try {
      if (editingId === null) {
        const { error: insertError } =
          await supabase
            .from("aid_distributions")
            .insert(payload);

        if (insertError) throw insertError;
      } else {
        const { data, error: updateError } =
          await supabase
            .from("aid_distributions")
            .update(payload)
            .eq("id", editingId)
            .select("id");

        if (updateError) throw updateError;

        if (!data || data.length === 0) {
          throw new Error(
            "Data tidak diperbarui. Periksa izin admin."
          );
        }
      }

      await loadData();

      setMessage(
        editingId === null
          ? "Distribusi bantuan berhasil ditambahkan."
          : "Distribusi bantuan berhasil diperbarui."
      );

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan data."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Distribution) {
    if (!authorized || deletingId !== null) return;

    const confirmed = window.confirm(
      `Yakin ingin menghapus distribusi bantuan #${item.id}?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
    setDeletingId(item.id);

    try {
      const { data, error: deleteError } =
        await supabase
          .from("aid_distributions")
          .delete()
          .eq("id", item.id)
          .select("id");

      if (deleteError) throw deleteError;

      if (!data || data.length === 0) {
        throw new Error(
          "Data tidak terhapus. Periksa izin admin."
        );
      }

      await loadData();

      setMessage(
        "Distribusi bantuan berhasil dihapus."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus data."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = distributions.filter((item) => {
    const keyword = search.toLowerCase();

    const shelterName =
      getShelterName(item.shelter_id);

    const aidName =
      getAidType(item.aid_type_id)?.aid_name ?? "";

    return (
      shelterName.toLowerCase().includes(keyword) ||
      aidName.toLowerCase().includes(keyword) ||
      item.distribution_date.includes(keyword) ||
      (item.notes ?? "")
        .toLowerCase()
        .includes(keyword)
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
              <Package size={22} />

              <p className="text-xs font-bold uppercase tracking-[0.3em]">
                Administrator / Aid Distribution
              </p>
            </div>

            <h1 className="mt-5 text-4xl font-black uppercase md:text-6xl">
              DISTRIBUSI
              <br />
              <span className="text-[#a8d9e8]">
                BANTUAN.
              </span>
            </h1>

            <p className="mt-5 text-sm text-slate-400">
              Pengelolaan distribusi bantuan simulasi
              banjir Jakarta 2020.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 bg-[#a8d9e8] px-5 py-4 text-sm font-bold text-[#080e14] hover:bg-white"
          >
            <Plus size={18} />
            Tambah Distribusi
          </button>
        </div>

        <section className="mt-12 border border-white/10 bg-[#101c26] p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">
                Total catatan distribusi
              </p>

              <p className="mt-2 text-3xl font-black text-[#a8d9e8]">
                {distributions.length}
              </p>
            </div>

            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 border border-white/20 px-4 py-3 text-sm hover:bg-white/5"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="mt-8 flex items-center gap-3 border border-white/15 bg-[#080e14] px-4">
            <Search
              size={18}
              className="text-[#a8d9e8]"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari posko, jenis bantuan, tanggal..."
              className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-600"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="mt-5 text-sm text-[#a8d9e8]"
            >
              {message}
            </p>
          )}

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-white/15 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-4">ID</th>
                  <th className="px-4 py-4">Posko</th>
                  <th className="px-4 py-4">Bantuan</th>
                  <th className="px-4 py-4">Jumlah</th>
                  <th className="px-4 py-4">Tanggal</th>
                  <th className="px-4 py-4">Catatan</th>
                  <th className="px-4 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => {
                  const aidType =
                    getAidType(item.aid_type_id);

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-white/10 hover:bg-white/5"
                    >
                      <td className="px-4 py-5 text-slate-400">
                        #{item.id}
                      </td>

                      <td className="px-4 py-5 font-semibold">
                        {getShelterName(item.shelter_id)}
                      </td>

                      <td className="px-4 py-5 text-slate-300">
                        {aidType?.aid_name ??
                          `Bantuan #${item.aid_type_id}`}
                      </td>

                      <td className="px-4 py-5 text-slate-300">
                        {item.quantity} {aidType?.unit ?? ""}
                      </td>

                      <td className="px-4 py-5 text-slate-300">
                        {item.distribution_date}
                      </td>

                      <td className="max-w-[200px] truncate px-4 py-5 text-slate-400">
                        {item.notes || "-"}
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => openEditForm(item)}
                            className="rounded border border-[#a8d9e8]/30 p-2 text-[#a8d9e8] hover:bg-[#a8d9e8]/10"
                            aria-label={`Edit distribusi ${item.id}`}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => handleDelete(item)}
                            disabled={deletingId !== null}
                            className="rounded border border-red-400/30 p-2 text-red-300 hover:bg-red-400/10 disabled:opacity-50"
                            aria-label={`Hapus distribusi ${item.id}`}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <p className="py-12 text-center text-slate-400">
                Tidak ada distribusi bantuan yang ditemukan.
              </p>
            )}
          </div>
        </section>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="aid-form-title"
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-white/15 bg-[#101c26] p-6 md:p-9"
            >
              <div className="flex items-center justify-between gap-4">
                <h2
                  id="aid-form-title"
                  className="text-2xl font-black uppercase"
                >
                  {editingId === null
                    ? "Tambah Distribusi"
                    : "Edit Distribusi"}
                </h2>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  aria-label="Tutup formulir"
                  className="text-slate-400 hover:text-white"
                >
                  <X size={22} />
                </button>
              </div>

              <form
                onSubmit={handleSave}
                className="mt-8 space-y-5"
              >
                <div>
                  <label
                    htmlFor="shelter"
                    className="mb-2 block text-sm text-slate-300"
                  >
                    Posko Tujuan
                  </label>

                  <select
                    id="shelter"
                    required
                    value={form.shelter_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        shelter_id: e.target.value,
                      })
                    }
                    className="w-full border border-white/15 bg-[#080e14] px-4 py-3 outline-none focus:border-[#a8d9e8]"
                  >
                    <option value="">Pilih posko</option>

                    {shelters.map((shelter) => (
                      <option
                        key={shelter.id}
                        value={shelter.id}
                      >
                        {shelter.shelter_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="aid-type"
                    className="mb-2 block text-sm text-slate-300"
                  >
                    Jenis Bantuan
                  </label>

                  <select
                    id="aid-type"
                    required
                    value={form.aid_type_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        aid_type_id: e.target.value,
                      })
                    }
                    className="w-full border border-white/15 bg-[#080e14] px-4 py-3 outline-none focus:border-[#a8d9e8]"
                  >
                    <option value="">Pilih bantuan</option>

                    {aidTypes.map((aid) => (
                      <option
                        key={aid.id}
                        value={aid.id}
                      >
                        {aid.aid_name} ({aid.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="quantity"
                    className="mb-2 block text-sm text-slate-300"
                  >
                    Jumlah Bantuan
                  </label>

                  <input
                    id="quantity"
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quantity: e.target.value,
                      })
                    }
                    className="w-full border border-white/15 bg-[#080e14] px-4 py-3 outline-none focus:border-[#a8d9e8]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="distribution-date"
                    className="mb-2 block text-sm text-slate-300"
                  >
                    Tanggal Distribusi
                  </label>

                  <input
                    id="distribution-date"
                    type="date"
                    required
                    value={form.distribution_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        distribution_date: e.target.value,
                      })
                    }
                    className="w-full border border-white/15 bg-[#080e14] px-4 py-3 outline-none focus:border-[#a8d9e8]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="mb-2 block text-sm text-slate-300"
                  >
                    Catatan (Opsional)
                  </label>

                  <textarea
                    id="notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notes: e.target.value,
                      })
                    }
                    className="w-full resize-none border border-white/15 bg-[#080e14] px-4 py-3 outline-none focus:border-[#a8d9e8]"
                  />
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
