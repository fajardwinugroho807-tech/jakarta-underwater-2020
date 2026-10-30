
"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  CloudRain,
  MapPin,
  Users,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

type FloodStatistic = {
  id: number;
  recorded_date: string | null;
  rainfall_mm: number | null;
  evacuee_count: number | null;
  affected_households: number | null;
  notes: string | null;
  source_url: string | null;
};

type ApiResponse = {
  success: boolean;
  statistics?: FloodStatistic[];
  error?: string;
};

type RainfallItem = {
  id: number;
  name: string;
  fullName: string;
  value: number;
  source: string | null;
};

const rainfallLocations = [
  { value: 377, name: "Halim", fullName: "TNI AU Halim" },
  { value: 335, name: "Taman Mini", fullName: "Taman Mini" },
  { value: 259, name: "Jatiasih", fullName: "Jatiasih" },
];

// Angka ini masih dari referensi BNPB, belum dari kolom database.
const affectedPoints = 41;

const affectedPointsSource =
  "https://bnpb.go.id/berita/infografis-1";

const rainfallSource =
  "https://bnpb.go.id/berita/hujan-ekstrem-penyebab-banjir-jakarta";

const evacueesSource =
  "https://bnpb.go.id/berita/perlu-ketegasan-pemimpin-di-daerah-dalam-menanggulangi-bencana-banjir-jabodetabek";

function AnimatedNumber({
  value,
  start,
  duration = 1800,
}: {
  value: number;
  start: boolean;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!start) return;

    let frame = 0;
    const startTime = performance.now();

    function animate(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [value, start, duration]);

  return <>{display.toLocaleString("id-ID")}</>;
}

export default function FloodDashboard() {
  const [selected, setSelected] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState<FloodStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sectionRef = useRef<HTMLElement>(null);

  async function loadStatistics(signal?: AbortSignal) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/flood-statistics", {
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        throw new Error(
          `Gagal mengambil statistik. HTTP ${response.status}`
        );
      }

      const result: ApiResponse = await response.json();

      if (!result.success || !Array.isArray(result.statistics)) {
        throw new Error(
          result.error || "Format data statistik tidak sesuai."
        );
      }

      setData(result.statistics);
      setSelected(0);
    } catch (err) {
      if (signal?.aborted) return;

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil statistik."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    loadStatistics(controller.signal);

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  // Gunakan catatan lokasi jika ada.
  // Untuk data historis yang sudah dimasukkan, cocokkan
  // nilai pengukuran dengan tiga lokasi yang diketahui.
  const rainfallData: RainfallItem[] = data
    .filter(
      (item) =>
        item.rainfall_mm !== null &&
        Number.isFinite(Number(item.rainfall_mm))
    )
    .map((item) => {
      const value = Number(item.rainfall_mm);
      const notes = (item.notes || "").toLowerCase();

      const location =
        rainfallLocations.find((place) =>
          notes.includes(place.name.toLowerCase())
        ) ||
        rainfallLocations.find((place) => place.value === value);

      return {
        id: item.id,
        name: location?.name || `Pengukuran ${item.id}`,
        fullName:
          location?.fullName ||
          item.notes ||
          `Pengukuran ${item.id}`,
        value,
        source: item.source_url || rainfallSource,
      };
    })
    .sort((a, b) => b.value - a.value);

  const maxRainfall = Math.max(
    1,
    ...rainfallData.map((item) => item.value)
  );

  const highestRainfall = rainfallData[0];

  // Ambil catatan pengungsi terbaru, bukan menjumlahkan
  // beberapa laporan yang bisa menghitung orang yang sama.
  const evacueeReports = data
    .filter((item) => item.evacuee_count !== null)
    .sort((a, b) =>
      (b.recorded_date || "").localeCompare(
        a.recorded_date || ""
      )
    );

  const latestEvacuees = evacueeReports[0];

  const statistics = [
    {
      label: "Curah Hujan Tertinggi",
      value: highestRainfall?.value ?? 0,
      unit: "mm",
      detail: highestRainfall?.fullName ?? "Belum ada data",
      icon: CloudRain,
    },
    {
      label: "Titik Terdampak Jakarta",
      value: affectedPoints,
      unit: "titik",
      detail: "Laporan BNPB, 1 Januari 2020",
      icon: MapPin,
    },
    {
      label: "Pengungsi DKI Jakarta",
      value: Number(latestEvacuees?.evacuee_count ?? 0),
      unit: "orang",
      detail: latestEvacuees?.recorded_date
        ? `Laporan ${new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          }).format(
            new Date(
              `${latestEvacuees.recorded_date}T00:00:00Z`
            )
          )}`
        : "Belum ada data",
      icon: Users,
    },
  ];

  const active = rainfallData[selected] ?? rainfallData[0];

  return (
    <section
      ref={sectionRef}
      id="flood-dashboard"
      className="overflow-hidden bg-[#0b1620] px-6 py-28 text-white md:px-12 md:py-36"
    >
      <div className="mx-auto max-w-[1600px]">
        {/* HEADER */}
        <div
          className={`transition-all duration-1000 ease-out ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-12 opacity-0"
          }`}
        >
          <div className="mb-5 flex items-center gap-3 text-[#a8d9e8]">
            <BarChart3 size={20} />
            <span className="text-xs font-bold uppercase tracking-[0.3em]">
              Historical Data / January 2020
            </span>
          </div>

          <h2 className="text-5xl font-black uppercase tracking-[-0.07em] md:text-8xl">
            BEHIND
            <br />
            <span className="text-[#a8d9e8]">
              THE NUMBERS.
            </span>
          </h2>

          <p className="mt-8 max-w-2xl text-base leading-8 text-slate-400">
            Angka-angka dari laporan awal banjir Jabodetabek
            menggambarkan intensitas hujan ekstrem dan dampaknya
            terhadap masyarakat.
          </p>

          <div className="mt-6 flex items-center gap-3 text-xs text-[#a8d9e8]">
            <span className="h-2 w-2 rounded-full bg-[#a8d9e8]" />
            Supabase Historical Statistics
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div
            role="status"
            className="mt-14 border border-white/10 bg-[#142532] p-10 text-center text-slate-400"
          >
            Mengambil statistik dari database...
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            role="alert"
            className="mt-14 border border-red-400/30 bg-[#142532] p-8"
          >
            <h3 className="text-xl font-bold text-red-300">
              Gagal memuat statistik
            </h3>

            <p className="mt-3 text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadStatistics()}
              className="mt-6 flex items-center gap-2 border border-[#a8d9e8] px-5 py-3 text-sm font-semibold text-[#a8d9e8] transition hover:bg-[#a8d9e8] hover:text-[#0b1620]"
            >
              <RefreshCw size={17} />
              Coba lagi
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && data.length === 0 && (
          <div className="mt-14 border border-white/10 bg-[#142532] p-10 text-slate-400">
            Belum ada statistik di database.
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <>
            {/* KARTU STATISTIK */}
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {statistics.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className={`border border-white/10 bg-[#142532] p-7 transition-all duration-1000 ease-out hover:border-[#a8d9e8]/50 md:p-9 ${
                      isVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-16 opacity-0"
                    }`}
                    style={{
                      transitionDelay: `${index * 180}ms`,
                    }}
                  >
                    <Icon
                      size={24}
                      className="mb-10 text-[#a8d9e8]"
                    />

                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                      {item.label}
                    </p>

                    <div className="mt-5 flex flex-wrap items-baseline gap-3">
                      <span className="text-5xl font-black tracking-tight md:text-6xl">
                        <AnimatedNumber
                          value={item.value}
                          start={isVisible}
                        />
                      </span>

                      <span className="text-sm text-[#a8d9e8]">
                        {item.unit}
                      </span>
                    </div>

                    <p className="mt-6 text-sm text-slate-400">
                      {item.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* GRAFIK DAN DETAIL */}
            <div
              className={`mt-8 grid gap-6 transition-all delay-300 duration-1000 lg:grid-cols-[1.5fr_1fr] ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-16 opacity-0"
              }`}
            >
              {/* GRAFIK CURAH HUJAN */}
              <div className="border border-white/10 bg-[#142532] p-7 md:p-10">
                <div className="mb-12">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a8d9e8]">
                    Rainfall Comparison
                  </p>

                  <h3 className="mt-4 text-2xl font-bold md:text-3xl">
                    Perbandingan Curah Hujan
                  </h3>

                  <p className="mt-3 text-sm text-slate-400">
                    Pilih batang grafik untuk melihat detail pengukuran.
                  </p>
                </div>

                <div className="space-y-9">
                  {rainfallData.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelected(index)}
                      aria-pressed={selected === index}
                      className="block w-full text-left"
                    >
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <span
                          className={`text-sm font-semibold ${
                            selected === index
                              ? "text-[#a8d9e8]"
                              : "text-slate-300"
                          }`}
                        >
                          {item.fullName}
                        </span>

                        <span className="text-sm font-bold">
                          {item.value} mm
                        </span>
                      </div>

                      <div className="h-5 overflow-hidden rounded-sm bg-white/10">
                        <div
                          className={`h-full transition-all duration-[1600ms] ease-out ${
                            selected === index
                              ? "bg-[#a8d9e8]"
                              : "bg-[#477d91]"
                          }`}
                          style={{
                            width: isVisible
                              ? `${(item.value / maxRainfall) * 100}%`
                              : "0%",
                            transitionDelay: `${index * 200}ms`,
                          }}
                        />
                      </div>
                    </button>
                  ))}

                  {rainfallData.length === 0 && (
                    <p className="text-sm text-slate-400">
                      Belum ada pengukuran curah hujan.
                    </p>
                  )}
                </div>

                <p className="mt-10 text-xs text-slate-500">
                  Satuan: milimeter (mm). Data berdasarkan publikasi
                  BNPB yang memuat pengukuran BMKG.
                </p>
              </div>

              {/* DETAIL INTERAKTIF */}
              <div className="flex flex-col justify-between border border-white/10 bg-[#19313f] p-7 md:p-10">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a8d9e8]">
                    Selected Measurement
                  </p>

                  <h3 className="mt-8 text-3xl font-black uppercase md:text-4xl">
                    {active?.fullName ?? "Belum ada data"}
                  </h3>

                  <div className="mt-10 flex items-baseline gap-3">
                    <span className="text-7xl font-black tracking-tight text-[#a8d9e8]">
                      <AnimatedNumber
                        value={active?.value ?? 0}
                        start={isVisible}
                        duration={900}
                      />
                    </span>

                    <span className="text-xl text-slate-300">
                      mm
                    </span>
                  </div>

                  <p className="mt-8 leading-8 text-slate-300">
                    Angka curah hujan yang tercatat pada lokasi
                    pengukuran ini dalam laporan hujan ekstrem
                    penyebab banjir Jakarta 2020.
                  </p>
                </div>

                {active && (
                  <a
                    href={active.source || rainfallSource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-12 flex items-center gap-3 self-start border-b border-[#a8d9e8] pb-2 text-sm font-bold uppercase tracking-widest text-[#a8d9e8]"
                  >
                    Sumber BNPB
                    <ArrowUpRight size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* CATATAN SUMBER */}
            <div className="mt-8 border-t border-white/10 pt-6 text-xs leading-7 text-slate-500">
              Curah hujan dan jumlah pengungsi diambil dari database
              Supabase berdasarkan laporan awal BNPB. Angka 41 titik
              terdampak masih menggunakan referensi BNPB langsung,
              belum disimpan sebagai kolom statistik.
              Angka pengungsi merupakan kondisi pada waktu laporan,
              bukan total akhir bencana.{" "}
              <a
                href={affectedPointsSource}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#a8d9e8] underline"
              >
                Sumber titik terdampak
              </a>
              {" · "}
              <a
                href={evacueesSource}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#a8d9e8] underline"
              >
                Sumber pengungsi
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
