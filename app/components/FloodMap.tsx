
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  Waves,
  Info,
  MapPin,
  RefreshCw,
} from "lucide-react";
import type { FloodLocation } from "./JakartaLeafletMap";

const JakartaLeafletMap = dynamic(
  () => import("./JakartaLeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#10212c] text-[#a8d9e8]">
        Memuat peta Jakarta...
      </div>
    ),
  }
);

type ApiResponse = {
  success: boolean;
  total?: number;
  locations?: FloodLocation[];
  error?: string;
};

export default function FloodMap() {
  const [locations, setLocations] = useState<FloodLocation[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLocations(signal?: AbortSignal) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/flood-locations", {
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        throw new Error(
          `Gagal mengambil lokasi. HTTP ${response.status}`
        );
      }

      const result: ApiResponse = await response.json();

      if (!result.success || !Array.isArray(result.locations)) {
        throw new Error(
          result.error || "Format data lokasi tidak sesuai."
        );
      }

      setLocations(result.locations);
      setSelected(0);
    } catch (err) {
      if (signal?.aborted) return;

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil lokasi."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    loadLocations(controller.signal);

    return () => controller.abort();
  }, []);

  const location = locations[selected];

  return (
    <section
      id="interactive-flood-map"
      className="bg-[#080e14] px-6 py-28 text-white md:px-12 md:py-36"
    >
      <div className="mx-auto max-w-[1600px]">
        {/* HEADER */}
        <div className="mb-12 flex items-center gap-3 text-[#a8d9e8]">
          <Waves size={20} />
          <span className="text-xs font-bold uppercase tracking-[0.3em]">
            Flood Geography / 2020
          </span>
        </div>

        <h2 className="mb-6 text-5xl font-black uppercase tracking-[-0.07em] md:text-8xl">
          THE FLOOD
          <br />
          <span className="text-[#a8d9e8]">MAP.</span>
        </h2>

        <p className="mb-12 max-w-2xl text-base leading-8 text-slate-400">
          Jelajahi wilayah administratif Jakarta melalui peta
          geografis interaktif dan baca ringkasan dampak banjir
          awal Januari 2020.
        </p>

        {/* DATABASE STATUS */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#a8d9e8]" />

          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#a8d9e8]">
            Supabase Flood Locations
          </span>

          {!loading && !error && (
            <span className="text-xs text-slate-500">
              / {locations.length} wilayah tercatat
            </span>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div
            role="status"
            className="flex min-h-[300px] items-center justify-center rounded-xl border border-white/10 bg-[#101c26] text-slate-400"
          >
            Mengambil lokasi dari database...
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-400/30 bg-[#101c26] p-8"
          >
            <h3 className="text-xl font-bold text-red-300">
              Gagal memuat peta
            </h3>

            <p className="mt-3 text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadLocations()}
              className="mt-6 flex items-center gap-2 border border-[#a8d9e8] px-5 py-3 text-sm font-semibold text-[#a8d9e8] transition hover:bg-[#a8d9e8] hover:text-[#080e14]"
            >
              <RefreshCw size={17} />
              Coba lagi
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && locations.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-[#101c26] p-8 text-slate-400">
            Belum ada lokasi yang tersimpan di database.
          </div>
        )}

        {/* MAP CONTENT */}
        {!loading && !error && location && (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* PETA LEAFLET */}
            <div className="relative h-[420px] overflow-hidden rounded-xl border border-white/10 md:h-[550px]">
              <JakartaLeafletMap
                selected={selected}
                locations={locations}
              />
            </div>

            {/* PANEL INFORMASI */}
            <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#101c26] p-7 md:p-10">
              <div>
                <div className="mb-8 flex items-center gap-3 text-[#a8d9e8]">
                  <Info size={18} />

                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    Regional Information
                  </span>
                </div>

                <p className="mb-3 text-sm text-slate-400">
                  {location.city || "DKI Jakarta"}
                </p>

                <h3 className="mb-6 text-3xl font-black uppercase md:text-5xl">
                  {location.location_name}
                </h3>

                <p className="text-base leading-8 text-slate-300">
                  {location.description ||
                    "Wilayah administratif Jakarta yang digunakan sebagai titik perwakilan pada peta."}
                </p>

                {/* PILIH WILAYAH */}
                <div className="mt-10">
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#a8d9e8]">
                    Pilih Wilayah
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {locations.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelected(index)}
                        aria-pressed={selected === index}
                        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                          selected === index
                            ? "border-[#a8d9e8] bg-[#a8d9e8] text-[#080e14]"
                            : "border-white/20 text-slate-300 hover:border-[#a8d9e8]"
                        }`}
                      >
                        <MapPin size={13} />
                        {item.location_name.replace("Jakarta ", "")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-white/10 pt-6 text-xs uppercase tracking-widest text-[#a8d9e8]">
                Wilayah {String(selected + 1).padStart(2, "0")} /{" "}
                {String(locations.length).padStart(2, "0")}
              </div>
            </div>
          </div>
        )}

        <p className="mt-6 text-xs leading-6 text-slate-500">
          Marker menunjukkan titik perwakilan wilayah
          administratif Jakarta yang tersimpan di database
          Supabase, bukan koordinat kejadian banjir aktual
          yang telah diverifikasi.
        </p>
      </div>
    </section>
  );
}
