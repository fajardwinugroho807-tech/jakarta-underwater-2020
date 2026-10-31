"use client";

import CinematicLoader from "./components/CinematicLoader";
import ScrollProgress from "./components/ScrollProgress";
import MobileNavigation from "./components/MobileNavigation";
import FloodDashboard from "./components/FloodDashboard";
import FloodMap from "./components/FloodMap";
import CinematicPhotoSlider from "./components/CinematicPhotoSlider";
import DocumentarySidebar from "./components/DocumentarySidebar";
import FloodTimeline from "./components/FloodTimeline";
import DisasterSection from "./components/DisasterSection";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Waves, LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react";
import gsap from "gsap";

const chapters = [
  {
    number: "01",
    category: "THE STORY",
    title: "Malam yang mengubah Jakarta.",
    description:
      "Menelusuri hujan ekstrem dan banjir pada pergantian tahun 2019 menuju 2020.",
    href: "#cerita",
  },
  {
    number: "02",
    category: "THE DATA",
    title: "Di balik angka, ada manusia.",
    description:
      "Eksplorasi data historis, dampak banjir, dan visualisasi statistik.",
    href: "#flood-dashboard",
  },
  {
    number: "03",
    category: "THE MAP",
    title: "Satu kota. Banyak cerita.",
    description:
      "Menjelajahi persebaran wilayah terdampak melalui peta interaktif.",
    href: "#peta",
  },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setIsLoggedIn(Boolean(data.session));
    }).catch(() => {
      if (active) setIsLoggedIn(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setIsLoggedIn(Boolean(session));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Gagal logout: " + error.message);
      return;
    }
    setIsLoggedIn(false);
  }

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        ".hero-reveal",
        { y: 75, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.3,
          stagger: 0.15,
          ease: "power3.out",
        }
      );
    }, containerRef);

    return () => context.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen overflow-x-hidden bg-[#080e14] text-[#f5f3ec]"
    >
    <CinematicLoader />
<ScrollProgress />

      {/* HEADER */}
      <header className="absolute left-0 top-0 z-30 w-full">
        <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-6 sm:px-6 md:px-12 md:py-7">
          <a href="#home" className="flex items-center gap-3">
            <Waves className="h-7 w-7 shrink-0 text-[#a8d9e8]" />

            <span className="text-xs font-black tracking-[0.15em] sm:text-sm sm:tracking-[0.2em]">
              JAKARTA / 2020
            </span>
          </a>

          {/* NAVIGASI DESKTOP */}
          <div className="hidden items-center gap-10 text-xs font-semibold uppercase tracking-[0.2em] md:flex">
            <a
              href="#cerita"
              className="transition hover:text-[#a8d9e8]"
            >
              The Story
            </a>

            <a
              href="#flood-dashboard"
              className="transition hover:text-[#a8d9e8]"
            >
              Explore Data
            </a>

            <a
              href="#peta"
              className="transition hover:text-[#a8d9e8]"
            >
              The Map
            </a>
          </div>

          {/* AKUN: DESKTOP + MOBILE */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn === true ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 border border-[#a8d9e8]/60 bg-[#080e14]/60 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#d5edf4] backdrop-blur-sm transition hover:bg-[#a8d9e8] hover:text-[#080e14] sm:px-4 sm:text-xs"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden items-center gap-2 bg-[#a8d9e8] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#080e14] transition hover:bg-white sm:inline-flex"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </>
            ) : isLoggedIn === false ? (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 border border-[#a8d9e8]/60 bg-[#080e14]/60 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#d5edf4] backdrop-blur-sm transition hover:bg-[#a8d9e8] hover:text-[#080e14] sm:px-4 sm:text-xs"
                >
                  <LogIn size={15} />
                  Login
                </Link>
                <Link
                  href="/register"
                  className="hidden items-center gap-2 bg-[#a8d9e8] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#080e14] transition hover:bg-white sm:inline-flex"
                >
                  <UserPlus size={15} />
                  Register
                </Link>
              </>
            ) : null}
            <MobileNavigation />
          </div>
        </nav>
      </header>

      <main id="home">
        <DocumentarySidebar />

        {/* HERO SECTION */}
        <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-12 pt-32 sm:px-6 sm:pb-16 md:min-h-screen md:px-12 md:pb-20 md:pt-36">
          {/* BACKGROUND */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=2000&q=85')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-[#07121c]/70 via-[#07121c]/40 to-[#07121c]" />
          <div className="absolute inset-0 bg-[#062337]/20" />

          <div className="relative z-10 mx-auto w-full max-w-[1600px]">
            {/* HERO LABEL */}
            <div className="hero-reveal mb-6 flex items-center gap-3 sm:gap-4 md:mb-7">
              <span className="h-px w-8 shrink-0 bg-[#a8d9e8] sm:w-12" />

              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c6e8ef] sm:text-xs sm:tracking-[0.35em]">
                An Interactive Documentary
              </span>
            </div>

            {/* RESPONSIVE HERO TITLE */}
            <h1 className="hero-reveal max-w-6xl text-[clamp(2.8rem,12vw,13rem)] font-black uppercase leading-[0.85] tracking-[-0.09em] sm:text-[clamp(4rem,12vw,13rem)] md:leading-[0.78]">
              JAKARTA
              <br />
              <span className="text-[#b2dce7]">UNDER</span>
              <br />
              WATER<span className="text-[#b2dce7]">.</span>
            </h1>

            {/* HERO DESCRIPTION */}
            <div className="mt-8 flex flex-col justify-between gap-6 border-t border-white/30 pt-6 sm:mt-10 md:mt-12 md:flex-row md:items-end md:gap-8 md:pt-7">
              <p className="hero-reveal max-w-lg text-sm leading-7 text-slate-200 sm:text-base sm:leading-8 md:text-lg">
                Januari 2020. Ketika hujan ekstrem melanda, Jakarta
                menghadapi salah satu peristiwa banjir besar dalam
                sejarahnya. Ini adalah kisah di balik air yang
                menggenangi ibu kota.
              </p>

              <a
                href="#cerita"
                className="hero-reveal group flex items-center gap-4 self-start text-xs font-bold uppercase tracking-[0.15em] sm:text-sm sm:tracking-[0.2em]"
              >
                Scroll to explore

                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/50 transition group-hover:bg-white group-hover:text-black sm:h-14 sm:w-14">
                  <ArrowDown size={21} />
                </span>
              </a>
            </div>
          </div>

          {/* COORDINATES */}
          <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 rotate-90 text-[10px] font-semibold uppercase tracking-[0.4em] text-white/60 lg:block">
            06°12&apos; S — 106°49&apos; E
          </div>
        </section>

        {/* INTRODUCTION */}
        <section
          id="cerita"
          className="relative mx-auto grid max-w-[1600px] gap-8 px-5 py-20 sm:px-6 sm:py-28 md:grid-cols-[1fr_2fr] md:gap-14 md:px-12 md:py-44"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#86bdcd]">
              001 / Introduction
            </span>
          </div>

          <div>
            <h2 className="max-w-4xl text-3xl font-semibold leading-[1.15] tracking-[-0.05em] sm:text-4xl md:text-7xl md:leading-[1.12]">
              Sebuah kota yang tak pernah tidur.
              <span className="text-[#78909d]">
                {" "}
                Hingga air mengubah segalanya.
              </span>
            </h2>

            <p className="mt-7 max-w-xl text-base leading-8 text-[#a4b3bd] sm:mt-10 sm:text-lg sm:leading-9">
              Pada awal Januari 2020, banjir merendam berbagai
              kawasan Jakarta dan sekitarnya. Melalui arsip,
              cerita, dan data, kita menelusuri apa yang terjadi
              serta dampaknya bagi kehidupan masyarakat.
            </p>

            <div className="mt-10 flex items-center gap-4 border-t border-white/15 pt-6 text-xs uppercase tracking-[0.15em] text-[#b2dce7] sm:mt-14 sm:text-sm sm:tracking-[0.2em]">
              <span>Explore the chapters</span>
              <ArrowDown size={18} />
            </div>
          </div>
        </section>

        {/* 12 CHAPTERS */}
        <DisasterSection />

        {/* CINEMATIC PHOTO GALLERY */}
        <CinematicPhotoSlider />

        {/* EXPLORE SECTION */}
        <section
          id="data"
          className="bg-[#dce5e5] px-5 py-20 text-[#101c24] sm:px-6 sm:py-28 md:px-12 md:py-36"
        >
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-16 md:gap-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#466777]">
                  Explore / The Experience
                </p>

                <h2 className="mt-5 text-[clamp(2.8rem,11vw,8rem)] font-black uppercase tracking-[-0.07em]">
                  GO DEEPER.
                </h2>
              </div>

              <p className="max-w-xs leading-7 text-[#536873]">
                Tiga cara untuk memahami peristiwa banjir
                Jakarta 2020.
              </p>
            </div>

            {/* CHAPTER CARDS */}
            <div className="grid gap-4 lg:grid-cols-3">
              {chapters.map((chapter) => (
                <a
                  key={chapter.number}
                  href={chapter.href}
                  className="group flex min-h-[300px] flex-col justify-between bg-[#f4f5f0] p-7 transition duration-500 hover:-translate-y-2 hover:bg-[#c4dce2] sm:min-h-[350px] sm:p-8 md:min-h-[390px] md:p-10"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold tracking-[0.2em]">
                      {chapter.category}
                    </span>

                    <ArrowUpRight
                      size={24}
                      className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </div>

                  <div>
                    <p className="mb-6 text-5xl font-light text-[#7493a1]">
                      {chapter.number}
                    </p>

                    <h3 className="text-2xl font-bold leading-tight tracking-[-0.04em] sm:text-3xl">
                      {chapter.title}
                    </h3>

                    <p className="mt-5 max-w-sm leading-7 text-[#586d77]">
                      {chapter.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <FloodTimeline />

        {/* STATISTICS DASHBOARD */}
        <FloodDashboard />

        {/* INTERACTIVE MAP */}
        <div id="peta">
          <FloodMap />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="flex flex-wrap items-center justify-between gap-5 border-t border-white/15 px-5 py-10 text-xs uppercase tracking-[0.15em] text-slate-400 sm:px-6 md:px-12">
        <span>Jakarta Underwater © 2026</span>

        <span>An Educational Digital Archive</span>

        <a
          href="#home"
          className="transition hover:text-[#a8d9e8]"
        >
          Back to top ↑
        </a>
      </footer>
    </div>
  );
}