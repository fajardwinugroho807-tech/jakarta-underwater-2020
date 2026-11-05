import Link from "next/link";
import ArchiveLayout from "../../components/ArchiveLayout";
import {
  ArrowRight,
  CloudRain,
  House,
  ShieldCheck,
  Siren,
  Waves,
  HeartHandshake,
  ExternalLink,
} from "lucide-react";

const langkah = [
  {
    nomor: "01",
    label: "SEBELUM BANJIR",
    title: "Siap sebelum air datang.",
    Icon: ShieldCheck,
    items: [
      "Pantau prakiraan cuaca dan peringatan resmi BMKG serta informasi BPBD setempat.",
      "Kenali jalur evakuasi, titik kumpul, dan tempat aman yang lebih tinggi.",
      "Siapkan tas siaga berisi obat, air minum, senter, dokumen kedap air, dan kebutuhan keluarga.",
      "Bersihkan saluran air secara aman dan jangan membuang sampah ke sungai atau drainase.",
    ],
  },
  {
    nomor: "02",
    label: "SAAT BANJIR",
    title: "Utamakan keselamatan jiwa.",
    Icon: Siren,
    items: [
      "Ikuti arahan evakuasi petugas dan menuju tempat aman apabila situasi memburuk.",
      "Jangan menerobos genangan atau arus banjir dengan berjalan kaki maupun kendaraan.",
      "Jauhi kabel dan peralatan listrik yang terendam; matikan listrik hanya bila aman dilakukan.",
      "Bantu anak-anak, lansia, penyandang disabilitas, dan tetangga yang memerlukan pendampingan.",
    ],
  },
  {
    nomor: "03",
    label: "SETELAH BANJIR",
    title: "Pulih dengan aman dan bertahap.",
    Icon: HeartHandshake,
    items: [
      "Kembali ke bangunan hanya setelah dinyatakan aman oleh petugas berwenang.",
      "Gunakan alas kaki dan pelindung saat membersihkan lumpur; waspadai benda tajam dan air tercemar.",
      "Periksa keamanan instalasi listrik dan gas sebelum digunakan kembali.",
      "Bersihkan serta keringkan ruang, dan gunakan air minum dari sumber yang dipastikan aman.",
    ],
  },
];

const strategi = [
  {
    title: "Infrastruktur & lingkungan",
    text: "Perbaikan drainase, pemeliharaan sungai, pengelolaan sampah, daerah resapan, dan ruang terbuka hijau membantu mengurangi risiko genangan.",
    Icon: Waves,
  },
  {
    title: "Tata ruang & permukiman",
    text: "Pembangunan perlu mempertimbangkan kawasan rawan, elevasi lahan, akses evakuasi, dan keselamatan kelompok rentan.",
    Icon: House,
  },
  {
    title: "Peringatan & kesiapsiagaan",
    text: "Pemantauan curah hujan, komunikasi peringatan, latihan evakuasi, dan koordinasi warga memperkuat respons saat cuaca ekstrem.",
    Icon: CloudRain,
  },
];

export default function MitigasiBanjirPage() {
  return (
    <ArchiveLayout>
      <article className="mx-auto w-full max-w-6xl pb-20">
        <div className="border-b border-white/15 pb-12 md:pb-16">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-[#a8d9e8]">
            Materi / Mitigasi banjir
          </p>
          <h1 className="max-w-5xl text-4xl font-black uppercase leading-[1.05] tracking-[-0.055em] sm:text-6xl md:text-7xl">
            Mengurangi risiko. <span className="text-[#a8d9e8]">Menyelamatkan kehidupan.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-base leading-8 text-slate-300 md:text-lg md:leading-9">
            Mitigasi banjir adalah upaya mengurangi risiko dan dampak banjir melalui
            pembangunan yang lebih aman, perlindungan lingkungan, kesiapsiagaan,
            dan pendidikan masyarakat. Pelajaran dari banjir Jakarta awal 2020
            mengingatkan pentingnya kesiapan sebelum hujan ekstrem terjadi.
          </p>
        </div>

        <section className="py-14 md:py-20" aria-labelledby="strategi-title">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#a8d9e8]">01 / Strategi mitigasi</p>
          <h2 id="strategi-title" className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            Bukan cuma soal menahan air.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {strategi.map(({title,text,Icon}) => (
              <div key={title} className="border border-white/10 bg-[#111f2a] p-7">
                <Icon className="mb-7 text-[#a8d9e8]" size={27} aria-hidden="true" />
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="langkah-title" className="border-t border-white/15 pt-14 md:pt-20">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#a8d9e8]">02 / Panduan kesiapsiagaan</p>
          <h2 id="langkah-title" className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            Apa yang perlu dilakukan?
          </h2>
          <div className="mt-9 space-y-5">
            {langkah.map(({nomor,label,title,Icon,items}) => (
              <section key={nomor} className="grid gap-7 border border-white/10 bg-[#111f2a] p-6 md:grid-cols-[240px_1fr] md:p-9">
                <div>
                  <p className="text-xs font-bold tracking-[0.25em] text-[#a8d9e8]">{nomor} / {label}</p>
                  <Icon className="my-5 text-[#a8d9e8]" size={32} aria-hidden="true" />
                  <h3 className="text-2xl font-black leading-snug">{title}</h3>
                </div>
                <ul className="space-y-4 text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                  {items.map((item) => (
                    <li key={item} className="flex gap-3 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                      <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#a8d9e8]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-14 border-l-2 border-[#a8d9e8] bg-[#142833] px-6 py-8 sm:px-9">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a8d9e8]">Catatan keselamatan</p>
          <p className="mt-4 max-w-4xl leading-8 text-slate-200">
            Panduan ini bersifat edukatif. Dalam keadaan darurat, ikuti informasi
            dan instruksi petugas setempat. Kondisi di lapangan bisa berubah cepat,
            termasuk arus air, risiko listrik, dan akses jalan.
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/materi/penyebab"
            className="inline-flex items-center gap-2 border border-[#a8d9e8]/60 px-6 py-4 text-sm font-bold text-[#d7eef4] transition hover:bg-[#a8d9e8] hover:text-[#080e14]"
          >
            Pelajari penyebab <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <a
            href="https://bpbd.jakarta.go.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-4 text-sm font-semibold text-slate-300 underline underline-offset-4 hover:text-white"
          >
            BPBD DKI Jakarta <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
      </article>
    </ArchiveLayout>
  );
}
