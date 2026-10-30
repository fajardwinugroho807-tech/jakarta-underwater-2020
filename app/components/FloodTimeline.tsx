
"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

type FloodEvent = {
  id: number;
  event_date: string;
  title: string;
  description: string | null;
  source_url: string | null;
};

type ApiResponse = {
  success: boolean;
  total?: number;
  events?: FloodEvent[];
  error?: string;
};

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return date;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(Date.UTC(year, month - 1, day)))
    .toUpperCase();
}

export default function FloodTimeline() {
  const [events, setEvents] = useState<FloodEvent[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEvents(signal?: AbortSignal) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/flood-events", {
        signal,
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Gagal mengambil data. HTTP ${response.status}`
        );
      }

      const result: ApiResponse = await response.json();

      if (!result.success || !Array.isArray(result.events)) {
        throw new Error(
          result.error || "Format data dari API tidak sesuai."
        );
      }

      setEvents(result.events);
      setActive(0);
    } catch (err) {
      if (signal?.aborted) return;

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    loadEvents(controller.signal);

    return () => controller.abort();
  }, []);

  const event = events[active];

  return (
    <section
      id="timeline"
      className="bg-[#101b23] px-6 py-28 text-[#f4f4ed] md:px-12"
    >
      <div className="mx-auto max-w-[1500px]">
        {/* SECTION LABEL */}
        <div className="flex items-center gap-3 text-[#9dcbd5]">
          <CalendarDays size={18} />

          <span className="text-xs font-bold uppercase tracking-[0.3em]">
            Chapter 03 / Historical Timeline
          </span>
        </div>

        {/* HEADING */}
        <h2 className="mt-8 text-5xl font-black uppercase leading-[0.95] tracking-[-0.07em] md:text-8xl">
          HISTORICAL
          <br />
          <span className="text-[#9dcbd5]">TIMELINE.</span>
        </h2>

        <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-400">
          Jelajahi kronologi banjir Jakarta 2020 berdasarkan data
          historis yang tersimpan di database Supabase.
          Pilih tanggal untuk membaca penjelasan dan sumber aslinya.
        </p>

        {/* DATABASE INDICATOR */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#9dcbd5]" />

          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9dcbd5]">
            Supabase Database
          </span>

          {!loading && !error && (
            <span className="text-xs text-slate-500">
              / {events.length} peristiwa tercatat
            </span>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div
            role="status"
            className="mt-16 flex min-h-[250px] flex-col items-center justify-center gap-4 border border-white/15 bg-[#172b37]"
          >
            <LoaderCircle
              size={32}
              className="animate-spin text-[#9dcbd5]"
            />

            <p className="text-sm tracking-wide text-slate-400">
              Mengambil kronologi dari database...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            role="alert"
            className="mt-16 border border-red-400/30 bg-[#172b37] p-8"
          >
            <h3 className="text-xl font-bold text-red-300">
              Gagal memuat timeline
            </h3>

            <p className="mt-3 text-sm text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadEvents()}
              className="mt-6 flex items-center gap-2 border border-[#9dcbd5] px-5 py-3 text-sm font-semibold text-[#9dcbd5] transition hover:bg-[#9dcbd5] hover:text-[#101b23]"
            >
              <RefreshCw size={17} />
              Coba lagi
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && events.length === 0 && (
          <div className="mt-16 border border-white/15 bg-[#172b37] p-8">
            <p className="text-slate-400">
              Belum ada kronologi yang tersimpan di database.
            </p>
          </div>
        )}

        {/* TIMELINE CONTENT */}
        {!loading && !error && event && (
          <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            {/* EVENT LIST */}
            <div className="border-t border-white/20">
              {events.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-pressed={active === index}
                  className={`flex w-full items-center gap-6 border-b border-white/20 px-4 py-6 text-left transition ${
                    active === index
                      ? "bg-[#213b49] text-white"
                      : "text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <span className="text-xs text-[#9dcbd5]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <p className="text-xs font-bold tracking-[0.15em] text-[#9dcbd5]">
                      {formatDate(item.event_date)}
                    </p>

                    <p className="mt-2 text-lg font-semibold">
                      {item.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* ACTIVE EVENT */}
            <article
              key={event.id}
              className="flex min-h-[390px] flex-col justify-between border border-white/15 bg-[#172b37] p-8 md:p-12"
            >
              <div>
                <p className="text-sm font-bold tracking-[0.2em] text-[#9dcbd5]">
                  {formatDate(event.event_date)}
                </p>

                <h3 className="mt-8 text-3xl font-bold leading-tight md:text-5xl">
                  {event.title}
                </h3>

                <p className="mt-8 text-lg leading-9 text-[#b1c0c8]">
                  {event.description ||
                    "Belum ada deskripsi untuk peristiwa ini."}
                </p>
              </div>

              {event.source_url && (
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-12 flex items-center gap-3 self-start border-b border-[#9dcbd5] pb-2 text-sm font-bold uppercase tracking-[0.15em] text-[#9dcbd5]"
                >
                  Baca sumber BNPB
                  <ArrowUpRight size={18} />
                </a>
              )}
            </article>
          </div>
        )}

        {/* FOOTNOTE */}
        <p className="mt-10 text-xs leading-6 text-slate-500">
          Kronologi pilihan berdasarkan publikasi BNPB.
          Waktu publikasi, waktu kejadian, dan waktu pembaruan
          statistik dapat berbeda. Ini bukan daftar lengkap
          seluruh kejadian banjir.
        </p>
      </div>
    </section>
  );
}
