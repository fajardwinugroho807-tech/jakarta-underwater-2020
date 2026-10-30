"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import {
  Waves, UserRound, Mail, LogOut, MapPin, ArrowRight,
  Search, Users, HousePlus, RefreshCw, CheckCircle2, AlertCircle,
  Building2, Loader2, ClipboardList, Home,
} from "lucide-react";

type Shelter = {
  id: number;
  shelter_name: string;
  address: string | null;
  capacity: number | null;
  occupied: number;
  remaining: number;
};

type PublicSearchResult = {
  full_name: string;
  shelter_name: string;
  shelter_address: string | null;
};

type RegistrationRecord = {
  id: number;
  full_name: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  admin_notes: string | null;
  shelter_id: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [name, setName] = useState("Pengguna");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [shelterLoading, setShelterLoading] = useState(true);
  const [shelterError, setShelterError] = useState("");
  const [shelterQuery, setShelterQuery] = useState("");
  const [personQuery, setPersonQuery] = useState("");
  const [personResults, setPersonResults] = useState<PublicSearchResult[]>([]);
  const [personSearching, setPersonSearching] = useState(false);
  const [personMessage, setPersonMessage] = useState("");
  const [registration, setRegistration] = useState({ full_name: "", age: "", origin_area: "", shelter_id: "" });
  const [registering, setRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [userId, setUserId] = useState("");
  const [history, setHistory] = useState<RegistrationRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    let active = true;
    async function checkUser() {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !data.user) {
        router.replace("/login");
        return;
      }
      const { data: admin } = await supabase
        .from("admins")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();
      if (!active) return;
      if (admin) {
        router.replace("/admin");
        return;
      }
      setName(data.user.user_metadata?.display_name || "Pengguna");
      setEmail(data.user.email || "");
      setUserId(data.user.id);
      setLoading(false);
    }
    void checkUser();
    return () => { active = false; };
  }, [router]);

  async function loadShelters() {
    setShelterLoading(true);
    setShelterError("");
    const { data, error } = await supabase
      .rpc("available_evacuation_shelters");
    if (error) {
      setShelterError("Data posko belum dapat diakses: " + error.message);
      setShelters([]);
    } else {
      setShelters((data || []) as Shelter[]);
    }
    setShelterLoading(false);
  }

  useEffect(() => { void loadShelters(); }, []);

  const filteredShelters = useMemo(() => {
    const q = shelterQuery.trim().toLocaleLowerCase("id-ID");
    if (!q) return shelters;
    return shelters.filter(s =>
      `${s.shelter_name} ${s.address || ""}`.toLocaleLowerCase("id-ID").includes(q)
    );
  }, [shelters, shelterQuery]);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    async function loadHistory() {
      setHistoryLoading(true);
      const { data, error } = await supabase
        .from("evacuation_registrations")
        .select("id, full_name, status, created_at, admin_notes, shelter_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) {
        setHistoryError(error.message);
      } else {
        setHistory((data || []) as RegistrationRecord[]);
        setHistoryError("");
      }
      setHistoryLoading(false);
    }
    void loadHistory();
    return () => { active = false; };
  }, [userId]);

  async function handleLogout() {
    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Logout gagal: " + error.message);
      setLoggingOut(false);
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRegisterMessage("");
    setRegisterSuccess(false);
    const fullName = registration.full_name.trim();
    const originArea = registration.origin_area.trim();
    const age = Number(registration.age);
    const shelterId = Number(registration.shelter_id);
    if (fullName.length < 2 || !originArea || !Number.isInteger(age) || age < 0 || age > 120 || !shelterId) {
      setRegisterMessage("Lengkapi nama, usia (0–120), daerah asal, dan pilihan posko.");
      return;
    }
    setRegistering(true);
    const { error } = await supabase.rpc("register_evacuation_auto", {
      p_full_name: fullName,
      p_age: age,
      p_origin_area: originArea,
      p_shelter_id: shelterId,
    });
    if (error) {
      setRegisterMessage("Pendaftaran gagal: " + error.message);
    } else {
      setRegisterSuccess(true);
      setRegisterMessage("Tempat berhasil tercatat! Konfirmasikan kedatangan kepada petugas posko.");
      setRegistration({ full_name: "", age: "", origin_area: "", shelter_id: "" });
      const { data: refreshed } = await supabase.from("evacuation_registrations")
        .select("id, full_name, status, created_at, admin_notes, shelter_id")
        .eq("user_id", userId).order("created_at", { ascending: false });
      if (refreshed) setHistory(refreshed as RegistrationRecord[]);
      void loadShelters();
    }
    setRegistering(false);
  }

  async function handlePersonSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPersonResults([]);
    setPersonMessage("");
    const query = personQuery.trim();
    if (query.length < 3) {
      setPersonMessage("Masukkan minimal 3 karakter nama.");
      return;
    }
    setPersonSearching(true);
    // RPC hanya mengembalikan entri yang secara eksplisit boleh dicari.
    const { data, error } = await supabase.rpc("search_evacuees_public", { search_name: query });
    if (error) {
      setPersonMessage("Pencarian belum tersedia. Pastikan fungsi pencarian aman sudah dipasang oleh administrator.");
    } else {
      const rows = (data || []) as PublicSearchResult[];
      setPersonResults(rows);
      if (rows.length === 0) setPersonMessage("Tidak ditemukan data yang diizinkan untuk ditampilkan. Hubungi petugas posko jika perlu bantuan mencari keluarga.");
    }
    setPersonSearching(false);
  }

  const fieldClass = "w-full rounded-lg border border-white/15 bg-[#080e14] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#a8d9e8]";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080e14] text-[#a8d9e8]">
        <p className="animate-pulse text-sm uppercase tracking-[0.3em]">Loading Dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080e14] px-5 py-12 text-white md:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-8">
          <Link href="/" className="flex items-center gap-3 text-[#a8d9e8]">
            <Waves size={28} />
            <span className="text-sm font-black uppercase tracking-[0.2em]">Jakarta Underwater / 2020</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-[#a8d9e8]/30 px-5 py-3 text-sm font-semibold text-[#a8d9e8] transition hover:bg-[#a8d9e8]/10"
            >
              <Home size={17} /> Kembali ke Beranda
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 border border-red-400/30 px-5 py-3 text-sm text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
            >
              <LogOut size={17} /> {loggingOut ? "Keluar..." : "Logout"}
            </button>
          </div>
        </header>

        <section className="py-14">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#a8d9e8]">User Dashboard</p>
          <h1 className="mt-5 text-4xl font-black uppercase md:text-6xl">
            WELCOME,<br /><span className="break-words text-[#a8d9e8]">{name}.</span>
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-slate-400">Selamat datang di dashboard pengguna Jakarta Underwater — 2020. Temukan posko, daftar mengungsi, atau cari informasi keluarga.</p>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <a href="#mengungsi" className="group border border-white/10 bg-[#101c26] p-6 transition hover:border-[#a8d9e8]/60">
            <HousePlus className="text-[#a8d9e8]" size={30} />
            <h2 className="mt-5 text-xl font-bold">Mau Mengungsi</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Daftarkan diri ke posko evakuasi.</p>
            <ArrowRight className="mt-6 transition group-hover:translate-x-1" size={20} />
          </a>
          <a href="#posko" className="group border border-white/10 bg-[#101c26] p-6 transition hover:border-[#a8d9e8]/60">
            <MapPin className="text-[#a8d9e8]" size={30} />
            <h2 className="mt-5 text-xl font-bold">Cari Posko</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Cari nama, alamat, dan informasi kapasitas posko.</p>
            <ArrowRight className="mt-6 transition group-hover:translate-x-1" size={20} />
          </a>
          <a href="#keluarga" className="group border border-white/10 bg-[#101c26] p-6 transition hover:border-[#a8d9e8]/60">
            <Users className="text-[#a8d9e8]" size={30} />
            <h2 className="mt-5 text-xl font-bold">Cari Keluarga / Orang</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Cari data yang telah diizinkan untuk ditampilkan.</p>
            <ArrowRight className="mt-6 transition group-hover:translate-x-1" size={20} />
          </a>
        </div>

        <section id="posko" className="mt-12 scroll-mt-8 border border-white/10 bg-[#101c26] p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 text-[#a8d9e8]"><Building2 size={24} /><h2 className="text-2xl font-bold text-white">Cari Posko Evakuasi</h2></div>
              <p className="mt-3 text-sm text-slate-400">Data posko berasal dari database Supabase.</p>
            </div>
            <button onClick={() => void loadShelters()} disabled={shelterLoading} className="flex items-center gap-2 border border-white/20 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"><RefreshCw size={16} /> Refresh</button>
          </div>
          <div className="relative mt-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input aria-label="Cari posko" className={`${fieldClass} pl-11`} placeholder="Cari nama posko atau alamat..." value={shelterQuery} onChange={e => setShelterQuery(e.target.value)} />
          </div>
          {shelterLoading ? <p className="mt-5 text-slate-400">Memuat data posko...</p> : shelterError ? <p className="mt-5 text-amber-300">{shelterError}</p> : filteredShelters.length === 0 ? <p className="mt-5 text-slate-400">Belum ada posko yang cocok.</p> : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {filteredShelters.map(s => (
                <div key={s.id} className="border border-white/10 bg-[#080e14] p-5">
                  <h3 className="text-lg font-semibold">{s.shelter_name}</h3>
                  <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-400"><MapPin size={16} className="mt-1 shrink-0" />{s.address || "Alamat belum tersedia"}</p>
                  <p className="mt-3 text-sm text-[#a8d9e8]">Kapasitas: {s.occupied} / {s.capacity ?? "?"} · Sisa: {s.remaining}</p>
                  <p className="mt-1 text-xs text-slate-500">Angka berdasarkan pendaftaran yang tercatat; konfirmasi kondisi posko kepada petugas.</p>
                  {s.remaining > 0 ? <a href="#mengungsi" onClick={() => setRegistration(r => ({ ...r, shelter_id: String(s.id) }))} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#a8d9e8] hover:text-white">Pilih posko ini <ArrowRight size={15} /></a> : <p className="mt-4 text-sm font-semibold text-red-300">Penuh / tidak tersedia</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="mengungsi" className="mt-8 scroll-mt-8 border border-white/10 bg-[#101c26] p-6 md:p-8">
          <div className="flex items-center gap-3 text-[#a8d9e8]"><HousePlus size={24} /><h2 className="text-2xl font-bold text-white">Mau Mengungsi</h2></div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">Isi data diri dan pilih posko. Pilih posko yang masih memiliki tempat. Pendaftaran langsung tercatat tanpa menunggu persetujuan ADMIN; kedatangan tetap perlu dikonfirmasi kepada petugas. Jangan gunakan data orang lain tanpa izin.</p>
          <form onSubmit={handleRegister} className="mt-7 grid gap-5 md:grid-cols-2">
            <label className="block text-sm text-slate-300">Nama lengkap
              <input required minLength={2} maxLength={150} className={`${fieldClass} mt-2`} placeholder="Nama lengkap" value={registration.full_name} onChange={e => setRegistration(r => ({ ...r, full_name: e.target.value }))} />
            </label>
            <label className="block text-sm text-slate-300">Usia
              <input required type="number" min="0" max="120" className={`${fieldClass} mt-2`} placeholder="Usia" value={registration.age} onChange={e => setRegistration(r => ({ ...r, age: e.target.value }))} />
            </label>
            <label className="block text-sm text-slate-300">Daerah asal
              <input required maxLength={200} className={`${fieldClass} mt-2`} placeholder="Contoh: Kampung Melayu" value={registration.origin_area} onChange={e => setRegistration(r => ({ ...r, origin_area: e.target.value }))} />
            </label>
            <label className="block text-sm text-slate-300">Pilih posko
              <select required className={`${fieldClass} mt-2`} value={registration.shelter_id} onChange={e => setRegistration(r => ({ ...r, shelter_id: e.target.value }))}>
                <option value="">-- Pilih posko --</option>
                {shelters.filter(s => s.remaining > 0).map(s => <option key={s.id} value={s.id}>{s.shelter_name} — sisa {s.remaining}</option>)}
              </select>
            </label>
            <div className="md:col-span-2">
              <button type="submit" disabled={registering || shelterLoading || !!shelterError} className="inline-flex items-center gap-2 bg-[#a8d9e8] px-6 py-3 text-sm font-bold text-[#080e14] transition hover:bg-white disabled:opacity-50">
                {registering ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {registering ? "Menyimpan..." : "Daftar Mengungsi"}
              </button>
              {registerMessage && <p role="status" className={`mt-4 flex items-start gap-2 text-sm ${registerSuccess ? "text-emerald-300" : "text-amber-300"}`}>{registerSuccess ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}{registerMessage}</p>}
            </div>
          </form>
        </section>

        <section id="keluarga" className="mt-8 scroll-mt-8 border border-white/10 bg-[#101c26] p-6 md:p-8">
          <div className="flex items-center gap-3 text-[#a8d9e8]"><Users size={24} /><h2 className="text-2xl font-bold text-white">Cari Keluarga / Orang</h2></div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">Pencarian hanya menampilkan data simulasi atau orang yang telah memberi izin untuk ditemukan. Tidak menemukan nama bukan berarti orang tersebut tidak berada di posko.</p>
          <form onSubmit={handlePersonSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input aria-label="Nama orang yang dicari" className={`${fieldClass} flex-1`} placeholder="Masukkan nama orang (minimal 3 huruf)..." value={personQuery} onChange={e => setPersonQuery(e.target.value)} />
            <button type="submit" disabled={personSearching} className="inline-flex items-center justify-center gap-2 bg-[#a8d9e8] px-6 py-3 text-sm font-bold text-[#080e14] hover:bg-white disabled:opacity-50">
              {personSearching ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
              Cari Orang
            </button>
          </form>
          {personMessage && <p role="status" className="mt-5 text-sm text-slate-300">{personMessage}</p>}
          {personResults.length > 0 && <div className="mt-6 grid gap-3 md:grid-cols-2">{personResults.map((person, i) => <div key={`${person.full_name}-${i}`} className="border border-white/10 bg-[#080e14] p-5"><h3 className="font-bold">{person.full_name}</h3><p className="mt-2 text-sm text-[#a8d9e8]">Posko: {person.shelter_name}</p><p className="mt-1 text-sm text-slate-400">{person.shelter_address || "Alamat belum tersedia"}</p></div>)}</div>}
        </section>

        <section id="riwayat" className="mt-8 scroll-mt-8 border border-white/10 bg-[#101c26] p-6 md:p-8">
          <div className="flex items-center gap-3 text-[#a8d9e8]">
            <ClipboardList size={24} />
            <h2 className="text-2xl font-bold text-white">Riwayat Pendaftaran</h2>
          </div>
          <p className="mt-3 text-sm text-slate-400">Lihat pendaftaran yang sudah tercatat. Status Disetujui berarti tempat tercatat, bukan kedatangan terkonfirmasi.</p>
          {historyLoading ? (
            <p className="mt-5 text-slate-400">Memuat riwayat...</p>
          ) : historyError ? (
            <p className="mt-5 text-amber-300">Riwayat belum dapat dimuat: {historyError}</p>
          ) : history.length === 0 ? (
            <p className="mt-5 text-slate-400">Belum ada pendaftaran.</p>
          ) : (
            <div className="mt-6 grid gap-3">
              {history.map(item => (
                <div key={item.id} className="flex flex-wrap items-start justify-between gap-4 border border-white/10 bg-[#080e14] p-5">
                  <div>
                    <p className="font-semibold">{item.full_name}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Posko: {shelters.find(s => s.id === item.shelter_id)?.shelter_name || `ID ${item.shelter_id}`}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleString("id-ID")}
                    </p>
                    {item.admin_notes && <p className="mt-2 text-sm text-slate-300">Catatan: {item.admin_notes}</p>}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    item.status === "approved" ? "bg-emerald-500/15 text-emerald-300" :
                    item.status === "rejected" ? "bg-red-500/15 text-red-300" :
                    "bg-amber-500/15 text-amber-300"
                  }`}>
                    {item.status === "approved" ? "Tempat tercatat" : item.status === "rejected" ? "Ditolak" : "Menunggu"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="border border-white/10 bg-[#101c26] p-7">
            <div className="mb-7 flex items-center gap-3 text-[#a8d9e8]"><UserRound size={22} /><h2 className="text-xl font-bold text-white">Informasi Akun</h2></div>
            <p className="text-sm text-slate-400">Nama Pengguna</p><p className="mt-2 break-words font-semibold">{name}</p>
            <div className="my-6 border-t border-white/10" />
            <div className="flex items-center gap-2 text-sm text-slate-400"><Mail size={16} /> Email</div><p className="mt-2 break-all font-semibold">{email}</p>
          </section>
          <section className="border border-white/10 bg-[#101c26] p-7">
            <div className="mb-7 flex items-center gap-3 text-[#a8d9e8]"><MapPin size={22} /><h2 className="text-xl font-bold text-white">Informasi Evakuasi</h2></div>
            <p className="leading-7 text-slate-400">Informasi posko dan pendaftaran pengungsi terhubung ke sistem Jakarta Underwater. Untuk kondisi darurat, utamakan petunjuk petugas setempat.</p>
            <Link href="/" className="mt-8 inline-flex items-center gap-3 bg-[#a8d9e8] px-5 py-3 text-sm font-bold text-[#080e14] transition hover:bg-white">Jelajahi Dokumenter <ArrowRight size={17} /></Link>
          </section>
        </div>
      </div>
    </main>
  );
}
