"use client";

/**
 * Peta historis banjir DKI Jakarta — data, bukan simulasi.
 * Komponen ini menggunakan halaman peta statis interaktif di /public/maps
 * agar tidak perlu memasang dependensi baru ke proyek lama.
 */
export default function HistoricalFloodMap() {
  return (
    <section className="w-full min-w-0 max-w-full space-y-5 overflow-x-hidden" aria-label="Peta interaktif banjir Jakarta Januari 2020">
      <div className="grid gap-4 border border-cyan-300/20 bg-[#10222c] p-5 sm:grid-cols-3 sm:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Periode peta genangan</p>
          <p className="mt-2 text-xl font-bold text-white">1–3 Januari 2020</p>
          <p className="mt-1 text-sm text-slate-300">Layer area genangan dari BNPB</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Laporan tinggi air</p>
          <p className="mt-2 text-xl font-bold text-white">1 Januari 2020</p>
          <p className="mt-1 text-sm text-slate-300">Titik dengan ukuran cm bersumber dari berita arsip</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Tipe visualisasi</p>
          <p className="mt-2 text-xl font-bold text-white">Data historis</p>
          <p className="mt-1 text-sm text-slate-300">Bukan prediksi atau animasi simulasi</p>
        </div>
      </div>
      <iframe
        title="Peta interaktif genangan dan ketinggian air Jakarta Januari 2020"
        src="/maps/banjir-jakarta-2020.html"
        className="block h-[720px] w-full max-w-full overflow-hidden rounded-xl border border-white/15 bg-[#081722] sm:h-[760px] lg:h-[800px]"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <div className="space-y-3 text-sm leading-7 text-slate-300">
        <p>
          <strong className="text-white">Cara baca:</strong> bidang biru menampilkan area genangan
          dari layer BNPB 1–3 Januari 2020 jika layanan dapat diakses. Titik berwarna menunjukkan
          laporan tinggi air berdasarkan lokasi, bukan kedalaman seluruh poligon.
          Titik ditempatkan pada perkiraan pusat kawasan, bukan titik ukur GPS.
        </p>
        <p>
          <strong className="text-white">Catatan periode:</strong> peta warna tahunan BPBD untuk
          seluruh 2020 adalah kumpulan kejadian selama setahun, tidak sama dengan
          satu peristiwa pada 1 Januari 2020. Angka RW tahunan juga bukan ketinggian air.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <a className="text-cyan-200 underline underline-offset-4" href="https://gis.bnpb.go.id/server/rest/services/Banjir_Jakarta_2020/GENANGAN_BANJIR_DKI_1_3_JANUARI_2020/MapServer" target="_blank" rel="noreferrer">BNPB — layer genangan 1–3 Januari</a>
          <a className="text-cyan-200 underline underline-offset-4" href="https://www.antaranews.com/interaktif/banjir/index.html" target="_blank" rel="noreferrer">ANTARA — laporan tinggi genangan 1 Januari</a>
          <a className="text-cyan-200 underline underline-offset-4" href="https://www.bnpb.go.id/berita/jabodetabek-dikepung-banjir-di-awal-tahun-baru-2020" target="_blank" rel="noreferrer">BNPB — laporan lapangan 1 Januari</a>
          <a className="text-cyan-200 underline underline-offset-4" href="https://bpbd.jakarta.go.id/ppid/infografis/51/peta-wilayah-banjir-tahun-2020" target="_blank" rel="noreferrer">BPBD — peta gabungan tahun 2020</a>
        </div>
      </div>
    </section>
  );
}
