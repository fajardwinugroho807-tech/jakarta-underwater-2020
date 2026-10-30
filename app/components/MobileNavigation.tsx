
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Waves,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

const menuItems = [
  { number: "01", label: "THE STORY", href: "#cerita" },
  { number: "02", label: "EXPLORE DATA", href: "#data" },
  { number: "03", label: "THE TIMELINE", href: "#flood-dashboard" },
  { number: "04", label: "THE MAP", href: "#peta" },
];

type AccountRole = "admin" | "user" | null;

export default function MobileNavigation() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<AccountRole>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [accountError, setAccountError] = useState("");

  // CEK LOGIN DAN ROLE PENGGUNA
  useEffect(() => {
    let active = true;

    async function checkAccount() {
      setAuthLoading(true);

      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

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

      if (!active) return;

      if (roleError) {
        setAccountError("Gagal memeriksa hak akses akun.");
        setRole(null);
      } else {
        setAccountError("");
        setRole(admin ? "admin" : "user");
      }

      setAuthLoading(false);
    }

    void checkAccount();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Jalankan setelah callback auth selesai
      // agar aman saat memanggil Supabase lagi.
      setTimeout(() => {
        if (active) {
          void checkAccount();
        }
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // KUNCI SCROLL SAAT MENU DIBUKA
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // TUTUP MENU DENGAN ESC
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function closeMenu() {
    setIsOpen(false);
  }

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
    closeMenu();
    router.replace("/");
    router.refresh();
    setLoggingOut(false);
  }

  const dashboardHref =
    role === "admin" ? "/admin" : "/dashboard";

  return (
    <>
      {/* TOMBOL HAMBURGER */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Tutup menu" : "Buka menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-panel"
        className="relative z-[110] flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-[#0b1620]/70 text-white transition hover:border-[#a8d9e8] md:hidden"
      >
        {isOpen ? <X size={21} /> : <Menu size={21} />}
      </button>

      {/* OVERLAY MENU */}
      <div
        id="mobile-navigation-panel"
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-[#080e14] px-7 pb-10 pt-28 text-white transition-all duration-500 ease-in-out md:hidden ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-6 opacity-0"
        }`}
      >
        <div className="mb-10 flex items-center gap-3 text-[#a8d9e8]">
          <Waves size={22} />

          <span className="text-xs font-bold uppercase tracking-[0.3em]">
            Jakarta / 2020
          </span>
        </div>

        <p className="mb-8 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Explore the documentary
        </p>

        {/* MENU ASLI TETAP ADA */}
        <nav className="flex flex-col">
          {menuItems.map((item, index) => (
            <a
              key={item.number}
              href={item.href}
              onClick={closeMenu}
              tabIndex={isOpen ? 0 : -1}
              className="group flex items-center justify-between gap-4 border-b border-white/15 py-6"
              style={{
                transitionDelay: isOpen
                  ? `${index * 80}ms`
                  : "0ms",
              }}
            >
              <div className="flex items-start gap-5">
                <span className="mt-2 text-xs font-bold text-[#a8d9e8]">
                  {item.number}
                </span>

                <span className="text-2xl font-black tracking-tight transition-colors group-hover:text-[#a8d9e8] sm:text-3xl">
                  {item.label}
                </span>
              </div>

              <ArrowUpRight
                size={22}
                className="shrink-0 text-[#a8d9e8] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </a>
          ))}

          {/* MENU DASHBOARD BERDASARKAN ROLE */}
          {!authLoading && role && (
            <Link
              href={dashboardHref}
              onClick={closeMenu}
              tabIndex={isOpen ? 0 : -1}
              className="group flex items-center justify-between gap-4 border-b border-white/15 py-6"
            >
              <div className="flex items-start gap-5">
                <span className="mt-2 text-xs font-bold text-[#a8d9e8]">
                  05
                </span>

                <span className="text-2xl font-black tracking-tight transition-colors group-hover:text-[#a8d9e8] sm:text-3xl">
                  DASHBOARD
                </span>
              </div>

              <LayoutDashboard
                size={22}
                className="shrink-0 text-[#a8d9e8]"
              />
            </Link>
          )}
        </nav>

        {/* MENU AKUN */}
        <div className="mt-8 space-y-4">
          {authLoading ? (
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Memeriksa akun...
            </p>
          ) : role ? (
            <>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Masuk sebagai {role === "admin" ? "ADMIN" : "PENGGUNA"}
              </p>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                tabIndex={isOpen ? 0 : -1}
                className="flex w-full items-center justify-between border border-white/20 px-5 py-4 text-sm font-bold uppercase tracking-widest transition hover:border-red-300 hover:text-red-300 disabled:opacity-50"
              >
                <span>
                  {loggingOut ? "Memproses..." : "LOGOUT"}
                </span>

                <LogOut size={19} />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={closeMenu}
              tabIndex={isOpen ? 0 : -1}
              className="flex items-center justify-between border border-white/20 px-5 py-4 text-sm font-bold uppercase tracking-widest transition hover:border-[#a8d9e8] hover:text-[#a8d9e8]"
            >
              <span>LOGIN</span>
              <LogIn size={19} />
            </Link>
          )}

          {accountError && (
            <p role="alert" className="text-sm text-red-300">
              {accountError}
            </p>
          )}
        </div>

        {/* FOOTER ASLI */}
        <div className="mt-auto pt-10">
          <div className="mb-5 h-px w-14 bg-[#a8d9e8]" />

          <p className="text-xs uppercase leading-7 tracking-[0.2em] text-slate-500">
            An Interactive Documentary
            <br />
            Jakarta Underwater — 2020
          </p>
        </div>
      </div>
    </>
  );
}
