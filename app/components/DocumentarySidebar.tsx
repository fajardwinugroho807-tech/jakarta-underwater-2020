"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Waves,
  House,
  CloudRain,
  ShieldCheck,
  ChartColumn,
  Clock3,
  Images,
  BookOpen,
  Map,
  FileText,
  ArrowUpRight,
  LayoutDashboard,
  LogIn,
  LogOut,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

const navigation = [
  { id: "home", label: "Beranda", icon: House, href: "/" },
  { id: "disaster", label: "Penyebab Banjir", icon: CloudRain, href: "/materi/penyebab" },
  { id: "rainfall-data", label: "Data & Statistik", icon: ChartColumn, href: "/eksplorasi/dashboard" },
  { id: "flood-chronology", label: "Kronologi", icon: Clock3, href: "/materi/kronologi" },
  { id: "flood-impact", label: "Dampak Banjir", icon: Waves, href: "/materi/dampak" },
  { id: "mitigasi", label: "Mitigasi Banjir", icon: ShieldCheck, href: "/materi/mitigasi" },
  { id: "cinematic-gallery", label: "Dokumentasi Foto", icon: Images, href: "/eksplorasi/galeri" },
  { id: "flood-chapters", label: "12 Bab Pembahasan", icon: BookOpen, href: "/materi/bab" },
  { id: "peta", label: "Peta Banjir", icon: Map, href: "/eksplorasi/peta" },
  { id: "simulation", label: "Simulasi Banjir & 3D", icon: CloudRain, href: "/eksplorasi/simulasi" },
  { id: "flood-sources", label: "Sumber Referensi", icon: FileText, href: "/materi/referensi" },
];

type AccountRole = "admin" | "user" | null;

export default function DocumentarySidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<AccountRole>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [accountError, setAccountError] = useState("");

  // PERIKSA LOGIN DAN ROLE
  useEffect(() => {
    let mounted = true;
    let requestId = 0;

    async function checkAccount() {
      const currentRequest = ++requestId;

      setAuthLoading(true);
      setAccountError("");

      const { data, error } = await supabase.auth.getUser();

      if (!mounted || currentRequest !== requestId) return;

      if (error || !data.user) {
        setRole(null);
        setAuthLoading(false);
        return;
      }

      const { data: admin, error: roleError } = await supabase
        .from("admins")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!mounted || currentRequest !== requestId) return;

      if (roleError) {
        setRole(null);
        setAccountError(
          "Gagal memeriksa hak akses akun: " + roleError.message
        );
      } else {
        setRole(admin ? "admin" : "user");
      }

      setAuthLoading(false);
    }

    void checkAccount();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Hindari query Supabase langsung di dalam callback auth.
      setTimeout(() => {
        if (mounted) void checkAccount();
      }, 0);
    });

    return () => {
      mounted = false;
      requestId++;
      subscription.unsubscribe();
    };
  }, []);

  // TUTUP SIDEBAR DENGAN ESC
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleEscape);

    return () =>
      window.removeEventListener("keydown", handleEscape);
  }, []);

  // Navigasi ke halaman materi dan eksplorasi yang baru.
  function navigate(id: string) {
    const item = navigation.find((entry) => entry.id === id);
    if (!item) return;
    setOpen(false);
    router.push(item.href);
  }

  // LOGOUT
  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setAccountError("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setAccountError(error.message);
      setLoggingOut(false);
      return;
    }

    setRole(null);
    setOpen(false);
    router.replace("/");
    router.refresh();
    setLoggingOut(false);
  }

  const dashboardHref =
    role === "admin" ? "/admin" : "/dashboard";

  return (
    <>
      {/* TOMBOL HAMBURGER ASLI */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka menu navigasi"
        aria-expanded={open}
        className="fixed left-5 top-5 z-[80] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#10212d]/95 text-[#9dcbd5] shadow-xl backdrop-blur-md transition hover:bg-[#1c3a4b] md:left-8 md:top-8"
      >
        <Menu size={24} />
      </button>

      {/* LATAR GELAP */}
      {open && (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
        />
      )}

      {/* PANEL SIDEBAR */}
      <aside
        aria-label="Navigasi utama website"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-[100] flex w-[min(88vw,380px)] flex-col border-r border-white/15 bg-[#0a1219] text-white shadow-2xl transition-transform duration-500 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* HEADER ASLI */}
        <div className="flex items-center justify-between border-b border-white/15 px-7 py-7">
          <div className="flex items-center gap-3">
            <Waves size={29} className="text-[#9dcbd5]" />

            <div>
              <p className="text-sm font-black tracking-tight">
                JAKARTA UNDERWATER
              </p>

              <p className="mt-1 text-[10px] tracking-[0.3em] text-[#9dcbd5]">
                DOCUMENTARY / 2020
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Tutup sidebar"
            className="rounded-full border border-white/20 p-2 text-white transition hover:bg-white/10"
          >
            <X size={21} />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-5 px-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#7897a7]">
            Explore The Story
          </p>

          <div className="space-y-2">
            {/* SEMUA MENU ASLI */}
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const selected = pathname === item.href;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  tabIndex={open ? 0 : -1}
                  className={`flex w-full items-center gap-4 rounded-lg px-4 py-4 text-left transition-all ${
                    selected
                      ? "bg-[#214455] text-[#c1e6ed]"
                      : "text-[#a3b6c0] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="w-6 text-xs text-[#6f8d9d]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <Icon size={20} className="shrink-0" />

                  <span className="flex-1 text-sm font-semibold">
                    {item.label}
                  </span>

                  {selected && <ArrowUpRight size={16} />}
                </button>
              );
            })}
          </div>

          {/* FITUR AKUN BARU */}
          <div className="mt-8 border-t border-white/15 pt-7">
            <p className="mb-5 px-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#7897a7]">
              Account & Dashboard
            </p>

            {authLoading ? (
              <p className="px-4 text-xs text-slate-400">
                Memeriksa akun...
              </p>
            ) : role ? (
              <div className="space-y-2">
                {/* DASHBOARD OTOMATIS */}
                <Link
                  href={dashboardHref}
                  onClick={() => setOpen(false)}
                  tabIndex={open ? 0 : -1}
                  className="flex w-full items-center gap-4 rounded-lg bg-[#214455] px-4 py-4 text-left text-[#c1e6ed] transition hover:bg-[#2b566b]"
                >
                  <span className="w-6 text-xs text-[#9dcbd5]">
                    {String(navigation.length + 1).padStart(2, "0")}
                  </span>

                  <LayoutDashboard
                    size={20}
                    className="shrink-0"
                  />

                  <span className="flex-1 text-sm font-semibold">
                    Dashboard {role === "admin" ? "Admin" : "Pengguna"}
                  </span>

                  <ArrowUpRight size={16} />
                </Link>

                <p className="px-4 pt-2 text-xs text-[#7897a7]">
                  Login sebagai {role === "admin" ? "ADMIN" : "PENGGUNA"}
                </p>

                {/* LOGOUT */}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  tabIndex={open ? 0 : -1}
                  className="flex w-full items-center gap-4 rounded-lg px-4 py-4 text-left text-[#a3b6c0] transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                >
                  <span className="w-6 text-xs text-[#6f8d9d]">
                    {String(navigation.length + 2).padStart(2, "0")}
                  </span>

                  <LogOut size={20} />

                  <span className="flex-1 text-sm font-semibold">
                    {loggingOut ? "Memproses..." : "Logout"}
                  </span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className="flex w-full items-center gap-4 rounded-lg px-4 py-4 text-left text-[#a3b6c0] transition hover:bg-white/10 hover:text-white"
              >
                <span className="w-6 text-xs text-[#6f8d9d]">
                  {String(navigation.length + 1).padStart(2, "0")}
                </span>

                <LogIn size={20} />

                <span className="flex-1 text-sm font-semibold">
                  Login
                </span>

                <ArrowUpRight size={16} />
              </Link>
            )}

            {accountError && (
              <p
                role="alert"
                className="px-4 pt-3 text-xs leading-5 text-red-300"
              >
                {accountError}
              </p>
            )}
          </div>
        </nav>

        {/* FOOTER ASLI */}
        <div className="border-t border-white/15 px-8 py-7">
          <p className="text-xs font-semibold text-[#9dcbd5]">
            THE CITY. THE RAIN. THE FLOOD.
          </p>

          <p className="mt-2 text-xs leading-6 text-[#7897a7]">
            Dokumenter edukatif banjir Jakarta 2020.
          </p>
        </div>
      </aside>
    </>
  );
}
