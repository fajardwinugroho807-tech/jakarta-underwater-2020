

"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { supabase } from "../../lib/supabase";

import {

  Waves,

  Users,

  MapPin,

  Package,

  ArrowRight,

  LogOut,

  ShieldCheck,

  Home,

  RefreshCw,

  Download,

} from "lucide-react";

type RecentAid = {

  id: number;

  shelter: string;

  aid: string;

  unit: string;

  quantity: number;

  date: string;

  notes: string | null;

};

export default function AdminDashboard() {

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [loggingOut, setLoggingOut] = useState(false);

  const [authorized, setAuthorized] = useState(false);

  const [adminName, setAdminName] = useState("Administrator");

  const [adminEmail, setAdminEmail] = useState("");

  const [error, setError] = useState("");

  const [stats, setStats] = useState({

    pengungsi: 0,

    posko: 0,

    bantuan: 0,

  });

  const [statsLoading, setStatsLoading] = useState(true);

  const [statsError, setStatsError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  const [recentAid, setRecentAid] = useState<RecentAid[]>([]);

  const [recentLoading, setRecentLoading] = useState(true);

  const [recentError, setRecentError] = useState("");

  const [exporting, setExporting] = useState(false);

  const [exportError, setExportError] = useState("");

  const [dateFrom, setDateFrom] = useState("");

  const [dateTo, setDateTo] = useState("");

  const [chartLoading, setChartLoading] = useState(true);

  const [chartError, setChartError] = useState("");

  const [chartGroups, setChartGroups] = useState<{ label: string; count: number }[]>([]);

  const [chartTypes, setChartTypes] = useState<{ label: string; count: number }[]>([]);

  const [chartSampleSize, setChartSampleSize] = useState(0);

  useEffect(() => {

    let active = true;

    async function checkAdmin() {

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

            .select("display_name")

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

        setAdminName(admin.display_name || "Administrator");

        setAdminEmail(data.user.email || "");

      } catch (err) {

        if (active) {

          setError(

            err instanceof Error

              ? err.message

              : "Gagal memeriksa akses admin."

          );

        }

      } finally {

        if (active) {

          setLoading(false);

        }

      }

    }

    checkAdmin();

    return () => {

      active = false;

    };

  }, [router]);

useEffect(() => {

  if (!authorized) return;

  let active = true;

  async function loadStats() {

    setStatsLoading(true);

    setStatsError("");

    const [pengungsi, posko, bantuan] = await Promise.all([

      supabase

        .from("evacuees")

        .select("*", { count: "exact", head: true }),

      supabase

        .from("shelters")

        .select("*", { count: "exact", head: true }),

      supabase

        .from("aid_distributions")

        .select("*", { count: "exact", head: true }),

    ]);

    if (!active) return;

    const firstError =

      pengungsi.error || posko.error || bantuan.error;

    if (firstError) {

      setStatsError(firstError.message);

    } else {

      setStats({

        pengungsi: pengungsi.count ?? 0,

        posko: posko.count ?? 0,

        bantuan: bantuan.count ?? 0,

      });

    }

    setStatsLoading(false);

  }

  loadStats();

  return () => {

    active = false;

  };

}, [authorized, refreshKey]);

  // Riwayat bantuan terbaru; tombol Refresh Data juga memperbarui bagian ini.

  useEffect(() => {

    if (!authorized) return;

    let active = true;

    async function loadRecentAid() {

      setRecentLoading(true);

      setRecentError("");

      try {

        let recentQuery = supabase

          .from("aid_distributions")

          .select("id, shelter_id, aid_type_id, quantity, distribution_date, notes");

        if (dateFrom) recentQuery = recentQuery.gte("distribution_date", dateFrom);

        if (dateTo) recentQuery = recentQuery.lte("distribution_date", dateTo);

        const [distributions, shelters, aidTypes] = await Promise.all([

          recentQuery

            .order("distribution_date", { ascending: false })

            .order("id", { ascending: false })

            .limit(5),

          supabase.from("shelters").select("id, shelter_name"),

          supabase.from("aid_types").select("id, aid_name, unit"),

        ]);

        if (!active) return;

        const queryError = distributions.error || shelters.error || aidTypes.error;

        if (queryError) throw new Error(queryError.message);

        const shelterMap = new Map(

          (shelters.data ?? []).map((s) => [Number(s.id), String(s.shelter_name)])

        );

        const aidMap = new Map(

          (aidTypes.data ?? []).map((a) => [Number(a.id), {

            name: String(a.aid_name),

            unit: String(a.unit),

          }])

        );

        setRecentAid((distributions.data ?? []).map((d) => {

          const aid = aidMap.get(Number(d.aid_type_id));

          return {

            id: Number(d.id),

            shelter: shelterMap.get(Number(d.shelter_id)) ?? `Posko #${d.shelter_id}`,

            aid: aid?.name ?? `Jenis bantuan #${d.aid_type_id}`,

            unit: aid?.unit ?? "unit",

            quantity: Number(d.quantity),

            date: String(d.distribution_date),

            notes: d.notes ? String(d.notes) : null,

          };

        }));

      } catch (err) {

        if (active) {

          setRecentError(err instanceof Error ? err.message : "Gagal memuat riwayat bantuan.");

        }

      } finally {

        if (active) setRecentLoading(false);

      }

    }

    void loadRecentAid();

    return () => { active = false; };

  }, [authorized, refreshKey, dateFrom, dateTo]);

  // STEP 50: Grafik jumlah catatan distribusi berdasarkan posko dan jenis bantuan.

  // Sampel maksimum 1.000 catatan terbaru; tidak menjumlahkan unit barang yang berbeda.

  useEffect(() => {

    if (!authorized) return;

    let active = true;

    async function loadCharts() {

      setChartLoading(true);

      setChartError("");

      try {

        const [rowsResult, sheltersResult, typesResult] = await Promise.all([

          supabase.from("aid_distributions")

            .select("id, shelter_id, aid_type_id")

            .order("id", { ascending: false })

            .limit(1000),

          supabase.from("shelters").select("id, shelter_name"),

          supabase.from("aid_types").select("id, aid_name"),

        ]);

        if (!active) return;

        const queryError = rowsResult.error || sheltersResult.error || typesResult.error;

        if (queryError) throw new Error(queryError.message);

        const shelterNames = new Map(

          (sheltersResult.data ?? []).map((row) => [Number(row.id), String(row.shelter_name)])

        );

        const typeNames = new Map(

          (typesResult.data ?? []).map((row) => [Number(row.id), String(row.aid_name)])

        );

        const byShelter = new Map<string, number>();

        const byType = new Map<string, number>();

        for (const row of rowsResult.data ?? []) {

          const shelter = shelterNames.get(Number(row.shelter_id)) ?? `Posko #${row.shelter_id}`;

          const type = typeNames.get(Number(row.aid_type_id)) ?? `Bantuan #${row.aid_type_id}`;

          byShelter.set(shelter, (byShelter.get(shelter) ?? 0) + 1);

          byType.set(type, (byType.get(type) ?? 0) + 1);

        }

        const topSix = (counts: Map<string, number>) =>

          Array.from(counts, ([label, count]) => ({ label, count }))

            .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

            .slice(0, 6);

        setChartGroups(topSix(byShelter));

        setChartTypes(topSix(byType));

        setChartSampleSize((rowsResult.data ?? []).length);

      } catch (err) {

        if (active) setChartError(err instanceof Error ? err.message : "Gagal memuat grafik.");

      } finally {

        if (active) setChartLoading(false);

      }

    }

    void loadCharts();

    return () => { active = false; };

  }, [authorized, refreshKey]);

  // STEP 49: Ekspor semua catatan distribusi bantuan sebagai CSV.

  async function handleExportCSV() {

    if (!authorized || exporting) return;

    setExporting(true);

    setExportError("");

    if (dateFrom && dateTo && dateFrom > dateTo) {

      setExportError("Tanggal awal tidak boleh setelah tanggal akhir.");

      setExporting(false);

      return;

    }

    try {

      // Validasi ulang sesi dan peran sebelum menyiapkan ekspor.

      const { data: auth, error: authError } = await supabase.auth.getUser();

      if (authError || !auth.user) throw new Error("Silakan login kembali.");

      const { data: admin, error: adminError } = await supabase

        .from("admins")

        .select("id")

        .eq("id", auth.user.id)

        .maybeSingle();

      if (adminError) throw new Error(adminError.message);

      if (!admin) throw new Error("Hanya administrator yang dapat mengekspor laporan.");

      const [sheltersResult, typesResult] = await Promise.all([

        supabase.from("shelters").select("id, shelter_name"),

        supabase.from("aid_types").select("id, aid_name, unit"),

      ]);

      if (sheltersResult.error) throw new Error(sheltersResult.error.message);

      if (typesResult.error) throw new Error(typesResult.error.message);

      const shelterNames = new Map(

        (sheltersResult.data ?? []).map((s) => [Number(s.id), String(s.shelter_name)])

      );

      const aidNames = new Map(

        (typesResult.data ?? []).map((a) => [Number(a.id), {

          name: String(a.aid_name), unit: String(a.unit),

        }])

      );

      type AidRow = {

        id: number;

        shelter_id: number;

        aid_type_id: number;

        quantity: number;

        distribution_date: string;

        notes: string | null;

      };

      const allRows: AidRow[] = [];

      const pageSize = 500;

      for (let start = 0; ; start += pageSize) {

        let exportQuery = supabase

          .from("aid_distributions")

          .select("id, shelter_id, aid_type_id, quantity, distribution_date, notes");

        if (dateFrom) exportQuery = exportQuery.gte("distribution_date", dateFrom);

        if (dateTo) exportQuery = exportQuery.lte("distribution_date", dateTo);

        const { data, error: queryError } = await exportQuery

          .order("distribution_date", { ascending: false })

          .order("id", { ascending: false })

          .range(start, start + pageSize - 1);

        if (queryError) throw new Error(queryError.message);

        const page = (data ?? []) as AidRow[];

        allRows.push(...page);

        if (page.length < pageSize) break;

      }

      if (allRows.length === 0) {

        setExportError("Belum ada data distribusi bantuan untuk diekspor.");

        return;

      }

      // Hindari formula injection saat file dibuka di Excel.

      function csvCell(value: string | number | null | undefined) {

        let text = String(value ?? "");

        if (/^\s*[=+@-]/.test(text)) text = "'" + text;

        return '"' + text.replace(/"/g, '""') + '"';

      }

      const header = ["ID", "Tanggal", "Posko", "Jenis Bantuan", "Jumlah", "Satuan", "Catatan"];

      const rows = allRows.map((r) => {

        const aid = aidNames.get(Number(r.aid_type_id));

        return [

          r.id,

          r.distribution_date,

          shelterNames.get(Number(r.shelter_id)) ?? `Posko #${r.shelter_id}`,

          aid?.name ?? `Jenis bantuan #${r.aid_type_id}`,

          r.quantity,

          aid?.unit ?? "unit",

          r.notes ?? "",

        ].map(csvCell).join(",");

      });

      const csv = "\uFEFF" + [header.map(csvCell).join(","), ...rows].join("\r\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `laporan-distribusi-bantuan-${dateFrom || "semua"}-sampai-${dateTo || "semua"}.csv`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);

    } catch (err) {

      setExportError(err instanceof Error ? err.message : "Gagal mengekspor laporan.");

    } finally {

      setExporting(false);

    }

  }

  async function handleLogout() {

    if (loggingOut) return;

    setLoggingOut(true);

    setError("");

    const { error: logoutError } =

      await supabase.auth.signOut();

    if (logoutError) {

      setError(logoutError.message);

      setLoggingOut(false);

      return;

    }

    router.replace("/login");

    router.refresh();

  }

  if (loading) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-[#080e14] text-[#a8d9e8]">

        <p className="animate-pulse text-sm font-bold uppercase tracking-[0.3em]">

          Memeriksa akses admin...

        </p>

      </main>

    );

  }

  if (!authorized) {

    return (

      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#080e14] px-6 text-white">

        <ShieldCheck

          size={42}

          className="text-[#a8d9e8]"

        />

        <h1 className="text-2xl font-black uppercase">

          Akses Belum Tersedia

        </h1>

        <p className="text-center text-sm text-red-300">

          {error || "Akun ini tidak memiliki akses admin."}

        </p>

        <Link

          href="/dashboard"

          className="text-sm text-[#a8d9e8] underline"

        >

          Kembali ke Beranda

        </Link>

      </main>

    );

  }

  const menus = [

    {

      title: "DATA PENGUNGSI",

      description:

        "Kelola data pengungsi simulasi, termasuk tambah, edit, cari, dan hapus data.",

      href: "/admin/pengungsi",

      icon: Users,

      number: "01",

    },

    {

      title: "POSKO EVAKUASI",

      description:

        "Kelola lokasi posko, alamat, kapasitas, dan koordinat evakuasi.",

      href: "/admin/posko",

      icon: MapPin,

      number: "02",

    },

    {

      title: "DISTRIBUSI BANTUAN",

      description:

        "Kelola catatan distribusi bantuan berdasarkan posko, jenis, jumlah, dan tanggal.",

      href: "/admin/bantuan",

      icon: Package,

      number: "03",

    },

  ];

  return (

    <main className="min-h-screen bg-[#080e14] text-white">

      {/* NAVBAR */}

      <header className="border-b border-white/10 bg-[#0b1620]">

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-6 md:px-12">

          <Link

            href="/"

            className="flex items-center gap-3 text-[#a8d9e8]"

          >

            <Waves size={26} />

            <span className="text-xs font-black uppercase tracking-[0.2em]">

              Jakarta Underwater / 2020

            </span>

          </Link>

          <div className="flex flex-wrap items-center gap-5">

            <Link

              href="/"

              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:text-white"

            >

              <Home size={16} />

              Kembali ke Beranda

            </Link>

            <button

              type="button"

              onClick={handleLogout}

              disabled={loggingOut}

              className="inline-flex items-center gap-2 border border-red-400/30 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"

            >

              <LogOut size={16} />

              {loggingOut ? "Keluar..." : "Logout"}

            </button>

          </div>

        </div>

      </header>

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-12 md:py-20">

        {/* HEADER */}

        <div className="flex flex-wrap items-start justify-between gap-8">

          <div>

            <div className="flex items-center gap-3 text-[#a8d9e8]">

              <ShieldCheck size={22} />

              <p className="text-xs font-bold uppercase tracking-[0.3em]">

                Administrator Access

              </p>

            </div>

            <h1 className="mt-6 text-4xl font-black uppercase leading-tight md:text-7xl">

              ADMIN

              <br />

              <span className="text-[#a8d9e8]">

                DASHBOARD.

              </span>

            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">

              Pusat pengelolaan data dokumentasi dan

              simulasi banjir Jakarta tahun 2020.

            </p>

          </div>

          <div className="border border-[#a8d9e8]/20 bg-[#101c26] px-6 py-5">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a8d9e8]">

              Logged in as

            </p>

            <p className="mt-3 text-lg font-bold">

              {adminName}

            </p>

            <p className="mt-1 text-sm text-slate-400">

              {adminEmail}

            </p>

            <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#a8d9e8]">

              <ShieldCheck size={15} />

              ADMINISTRATOR

            </p>

          </div>

        </div>

        {/* DIVIDER */}

        <div className="my-14 h-px bg-white/10" />

{/* STATISTIK DATABASE */}

<section className="mb-14">

  <div className="mb-5 flex flex-wrap items-center justify-between gap-4">

    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#a8d9e8]">

      Live Database Overview

    </p>

    <button

      type="button"

      onClick={() => setRefreshKey((prev) => prev + 1)}

      disabled={statsLoading}

      className="flex items-center gap-2 border border-[#a8d9e8]/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#a8d9e8] transition hover:bg-[#a8d9e8]/10 disabled:cursor-not-allowed disabled:opacity-50"

    >

      <RefreshCw size={16} className={statsLoading ? "animate-spin" : ""} />

      {statsLoading ? "Memuat..." : "Refresh Data"}

    </button>

  </div>

  <div className="grid gap-5 md:grid-cols-3">

    {[

      {

        label: "Total Pengungsi",

        value: stats.pengungsi,

        icon: Users,

      },

      {

        label: "Total Posko",

        value: stats.posko,

        icon: MapPin,

      },

      {

        label: "Distribusi Bantuan",

        value: stats.bantuan,

        icon: Package,

      },

    ].map((item) => {

      const Icon = item.icon;

      return (

        <div

          key={item.label}

          className="border border-[#a8d9e8]/20 bg-[#101c26] p-7"

        >

          <div className="flex items-center justify-between">

            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">

              {item.label}

            </p>

            <Icon size={24} className="text-[#a8d9e8]" />

          </div>

          <p className="mt-7 text-5xl font-black">

            {statsLoading || statsError

              ? "—"

              : item.value.toLocaleString("id-ID")}

          </p>

          <p className="mt-4 text-xs uppercase tracking-wider text-[#a8d9e8]">

            {statsLoading

              ? "Memuat data..."

              : statsError

                ? "Data tidak tersedia"

                : "Data Supabase"}

          </p>

        </div>

      );

    })}

  </div>

  {statsError && (

    <p role="alert" className="mt-4 text-sm text-red-300">

      Gagal mengambil statistik: {statsError}

    </p>

  )}

</section>

        {/* STEP 50 — GRAFIK DISTRIBUSI BANTUAN */}

        <section className="mb-14">

          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#a8d9e8]">

            Data Visualization

          </p>

          <h2 className="mt-3 text-2xl font-black uppercase md:text-3xl">

            GRAFIK DISTRIBUSI BANTUAN

          </h2>

          <p className="mt-3 mb-6 text-sm leading-6 text-slate-400">

            Jumlah catatan distribusi per posko dan jenis bantuan, bukan jumlah barang.

            Menggunakan hingga 1.000 catatan terbaru (data simulasi).

          </p>

          {chartLoading ? (

            <div className="border border-white/10 bg-[#101c26] p-7 text-sm text-slate-400">

              Memuat grafik dari Supabase...

            </div>

          ) : chartError ? (

            <p role="alert" className="border border-red-400/20 bg-[#101c26] p-7 text-sm text-red-300">

              Gagal memuat grafik: {chartError}

            </p>

          ) : chartSampleSize === 0 ? (

            <div className="border border-white/10 bg-[#101c26] p-7 text-sm text-slate-400">

              Belum ada catatan distribusi untuk ditampilkan pada grafik.

            </div>

          ) : (

            <div className="grid gap-6 lg:grid-cols-2">

              {[

                { title: "Distribusi per Posko", data: chartGroups },

                { title: "Distribusi per Jenis Bantuan", data: chartTypes },

              ].map((chart) => {

                const maxCount = Math.max(1, ...chart.data.map((item) => item.count));

                return (

                  <div key={chart.title} className="border border-[#a8d9e8]/20 bg-[#101c26] p-6 md:p-7">

                    <h3 className="mb-7 text-sm font-bold uppercase tracking-wider text-[#a8d9e8]">

                      {chart.title}

                    </h3>

                    <div className="space-y-5">

                      {chart.data.map((item) => (

                        <div key={item.label}>

                          <div className="mb-2 flex items-start justify-between gap-3 text-sm">

                            <span className="min-w-0 break-words text-slate-300">{item.label}</span>

                            <span className="shrink-0 font-bold text-white">

                              {item.count.toLocaleString("id-ID")}

                            </span>

                          </div>

                          <div

                            className="h-3 w-full overflow-hidden bg-[#263440]"

                            role="img"

                            aria-label={`${item.label}: ${item.count} catatan distribusi`}

                          >

                            <div

                              className="h-full bg-[#a8d9e8]"

                              style={{ width: `${(item.count / maxCount) * 100}%` }}

                            />

                          </div>

                        </div>

                      ))}

                    </div>

                  </div>

                );

              })}

            </div>

          )}

          {!chartLoading && !chartError && chartSampleSize > 0 && (

            <p className="mt-4 text-xs text-slate-500">

              Grafik dihitung dari {chartSampleSize.toLocaleString("id-ID")} catatan terbaru.

              Maksimal 6 kategori terbesar ditampilkan per grafik. Klik Refresh Data untuk memperbarui.

            </p>

          )}

        </section>

        {/* DISTRIBUSI BANTUAN TERBARU */}

        <section className="mb-14">

          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#a8d9e8]">

                Latest Activity

              </p>

              <h2 className="mt-3 text-2xl font-black uppercase md:text-3xl">

                DISTRIBUSI BANTUAN TERBARU

              </h2>

              <p className="mt-2 text-sm text-slate-400">

                Lima catatan terbaru sesuai rentang tanggal (data simulasi).

              </p>

            </div>

            <div className="flex flex-wrap items-center gap-4">

              <button

                type="button"

                onClick={() => void handleExportCSV()}

                disabled={exporting}

                className="inline-flex items-center gap-2 border border-[#a8d9e8]/30 px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#a8d9e8] transition hover:bg-[#a8d9e8]/10 disabled:opacity-50"

              >

                <Download size={16} />

                {exporting ? "Menyiapkan CSV..." : "Export CSV"}

              </button>

              <Link

                href="/admin/bantuan"

                className="inline-flex items-center gap-2 text-sm font-bold text-[#a8d9e8] hover:text-white"

              >

                Kelola Bantuan <ArrowRight size={18} />

              </Link>

            </div>

          </div>

          <div className="mb-5 flex flex-wrap items-end gap-4 border border-white/10 bg-[#101c26] p-5">

            <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">

              Dari Tanggal

              <input type="date" value={dateFrom} max={dateTo || undefined}

                onChange={(e) => { setDateFrom(e.target.value); setExportError(""); }}

                className="border border-white/20 bg-[#080e14] px-3 py-2 text-sm text-white [color-scheme:dark]" />

            </label>

            <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">

              Sampai Tanggal

              <input type="date" value={dateTo} min={dateFrom || undefined}

                onChange={(e) => { setDateTo(e.target.value); setExportError(""); }}

                className="border border-white/20 bg-[#080e14] px-3 py-2 text-sm text-white [color-scheme:dark]" />

            </label>

            <button type="button" onClick={() => { setDateFrom(""); setDateTo(""); setExportError(""); }}

              className="border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white">

              Reset Filter

            </button>

            <p className="text-xs text-slate-400">Filter berlaku untuk riwayat di bawah dan file CSV. Grafik tetap seluruh periode.</p>

          </div>

          {dateFrom && dateTo && dateFrom > dateTo && (

            <p role="alert" className="mb-4 text-sm text-red-300">Rentang tanggal tidak valid.</p>

          )}

          {exportError && (

            <p role="alert" className="mb-4 text-sm text-red-300">

              {exportError}

            </p>

          )}

          <div className="overflow-x-auto border border-white/10 bg-[#101c26]">

            {recentLoading ? (

              <p className="p-7 text-sm text-slate-400">Memuat riwayat bantuan...</p>

            ) : recentError ? (

              <p role="alert" className="p-7 text-sm text-red-300">

                Gagal memuat riwayat: {recentError}

              </p>

            ) : recentAid.length === 0 ? (

              <p className="p-7 text-sm text-slate-400">

                Tidak ada catatan distribusi bantuan pada rentang tanggal ini.

              </p>

            ) : (

              <table className="w-full min-w-[680px] text-left text-sm">

                <thead className="border-b border-white/10 bg-[#0b1620] text-xs uppercase tracking-wider text-[#a8d9e8]">

                  <tr>

                    <th className="px-5 py-4">Tanggal</th>

                    <th className="px-5 py-4">Posko</th>

                    <th className="px-5 py-4">Jenis Bantuan</th>

                    <th className="px-5 py-4">Jumlah</th>

                    <th className="px-5 py-4">Catatan</th>

                  </tr>

                </thead>

                <tbody>

                  {recentAid.map((item) => (

                    <tr key={item.id} className="border-b border-white/10 last:border-b-0">

                      <td className="whitespace-nowrap px-5 py-4 text-slate-300">

                        {item.date.split("-").reverse().join("/")}

                      </td>

                      <td className="px-5 py-4 font-semibold">{item.shelter}</td>

                      <td className="px-5 py-4 text-slate-300">{item.aid}</td>

                      <td className="whitespace-nowrap px-5 py-4 text-[#a8d9e8]">

                        {item.quantity.toLocaleString("id-ID")} {item.unit}

                      </td>

                      <td className="max-w-[240px] px-5 py-4 text-slate-400">

                        {item.notes || "—"}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </section>

        {/* MENU */}

        <div className="mb-8">

          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#a8d9e8]">

            Management System

          </p>

          <h2 className="mt-3 text-2xl font-black uppercase md:text-3xl">

            PILIH MENU PENGELOLAAN

          </h2>

        </div>

        <div className="grid gap-6 md:grid-cols-3">

          {menus.map((menu) => {

            const Icon = menu.icon;

            return (

              <Link

                key={menu.href}

                href={menu.href}

                className="group flex min-h-[320px] flex-col justify-between border border-white/10 bg-[#101c26] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#a8d9e8]/60 hover:bg-[#142632]"

              >

                <div>

                  <div className="flex items-start justify-between">

                    <div className="flex h-14 w-14 items-center justify-center border border-[#a8d9e8]/25 bg-[#a8d9e8]/5 text-[#a8d9e8]">

                      <Icon size={28} />

                    </div>

                    <span className="text-sm font-black text-slate-600">

                      {menu.number}

                    </span>

                  </div>

                  <h3 className="mt-10 text-xl font-black uppercase">

                    {menu.title}

                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-400">

                    {menu.description}

                  </p>

                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-sm font-bold text-[#a8d9e8]">

                  <span>KELOLA DATA</span>

                  <ArrowRight

                    size={20}

                    className="transition-transform group-hover:translate-x-2"

                  />

                </div>

              </Link>

            );

          })}

        </div>

        {/* FOOTER */}

        <div className="mt-16 border-t border-white/10 pt-8">

          <p className="text-xs leading-6 text-slate-500">

            JAKARTA UNDERWATER — 2020

            <br />

            Administrator Management System

            <br />

            Data pengungsi, posko, dan bantuan pada modul

            pengelolaan merupakan data simulasi.

          </p>

        </div>

        {error && (

          <p role="alert" className="mt-6 text-sm text-red-300">

            {error}

          </p>

        )}

      </div>

    </main>

  );

}
