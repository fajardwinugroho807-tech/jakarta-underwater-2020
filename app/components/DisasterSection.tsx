
"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDownRight,
  CloudRain,
  Waves,
  Building2,
  Wind,
  Droplets,
  BookOpen,
  ChevronDown,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// SUMBER RESMI
const sources = [
  {
    name: "BNPB — Hujan Ekstrem Penyebab Banjir Jakarta",
    url: "https://www.bnpb.go.id/index.php/berita/hujan-ekstrem-penyebab-banjir-jakarta",
  },
  {
    name: "BMKG — Majalah KLIMA Edisi 3",
    url: "https://iklim.bmkg.go.id/bmkgadmin/storage/majalahklima/Majalah%20Klima%20Edisi%203.pdf",
  },
];

// FAKTOR PENYEBAB
const factors = [
  {
    number: "01",
    icon: CloudRain,
    title: "Hujan Ekstrem",
    description:
      "Hujan sangat lebat pada pergantian tahun 2019–2020 meningkatkan limpasan permukaan, debit sungai, dan beban sistem drainase.",
  },
  {
    number: "02",
    icon: Waves,
    title: "Sungai dan Drainase",
    description:
      "Air dari hujan lokal dan aliran sungai dapat menyebabkan genangan atau luapan ketika kapasitas aliran terlampaui.",
  },
  {
    number: "03",
    icon: Building2,
    title: "Kerentanan Perkotaan",
    description:
      "Dataran rendah, kawasan padat bangunan, berkurangnya resapan, dan kondisi pesisir meningkatkan risiko banjir.",
  },
];

// DATA HUJAN
const rainfall = [
  { place: "TNI AU Halim", value: 377 },
  { place: "Taman Mini", value: 335 },
  { place: "Jatiasih", value: 259 },
];

// MATERI LENGKAP
const chapters = [
  {
    number: "01",
    title: "Kondisi Geografis Jakarta",
    paragraphs: [
      "Jakarta terletak di bagian barat laut Pulau Jawa dan berbatasan langsung dengan Laut Jawa. Wilayahnya merupakan bagian hilir dari sejumlah daerah aliran sungai yang menghubungkan kawasan pegunungan dan dataran tinggi di selatan dengan kawasan pesisir di utara.",
      "Air yang melewati Jakarta tidak seluruhnya berasal dari hujan yang turun di dalam wilayah administratif kota. Curah hujan di daerah hulu dapat menambah debit sungai yang mengalir menuju Jakarta. Hal ini menjadikan pengelolaan banjir berkaitan erat dengan kondisi wilayah di sekitarnya.",
      "Sebagian wilayah Jakarta memiliki elevasi rendah. Di kawasan pesisir, kemampuan air mengalir menuju laut dapat dipengaruhi kondisi pasang dan sistem pengendalian air. Kerentanan banjir berbeda antara kawasan pesisir, bantaran sungai, dan daerah perkotaan yang jauh dari sungai.",
    ],
  },
  {
    number: "02",
    title: "Sejarah Banjir Jakarta",
    paragraphs: [
      "Banjir bukan fenomena baru bagi Jakarta. Sejak masa Batavia, persoalan genangan dan luapan sungai telah mendorong pembangunan kanal serta berbagai infrastruktur pengendali air.",
      "Seiring perkembangan kota, pembangunan permukiman, kawasan perdagangan, jalan, dan infrastruktur mengubah karakteristik permukaan tanah. Banyak lahan yang sebelumnya dapat menyerap air berubah menjadi permukaan kedap air.",
      "Banjir besar pada beberapa periode sebelum 2020 menunjukkan bahwa risiko banjir tidak dapat dijelaskan hanya oleh satu faktor. Curah hujan, perubahan tata guna lahan, kondisi sungai, serta kesiapan sistem pengendalian air perlu diperhatikan bersama.",
    ],
  },
  {
    number: "03",
    title: "Kronologi Pergantian Tahun 2019–2020",
    paragraphs: [
      "Menjelang pergantian tahun, hujan turun di Jakarta dan wilayah sekitarnya. Pada malam 31 Desember 2019 hingga pagi 1 Januari 2020, intensitas hujan yang sangat tinggi menjadi faktor utama meningkatnya jumlah air di permukaan dan saluran.",
      "Pada 1 Januari 2020, banjir melanda berbagai kawasan Jakarta dan wilayah penyangganya. Kondisi setiap lokasi berbeda karena dipengaruhi intensitas hujan, ketinggian lahan, aliran sungai, serta kapasitas drainase.",
      "Memasuki awal Januari, penanganan dilakukan melalui pemantauan kondisi banjir, evakuasi warga, penyediaan bantuan, dan upaya pemulihan. Laporan mengenai lokasi terdampak, korban, dan pengungsi diperbarui seiring berkembangnya situasi.",
    ],
  },
  {
    number: "04",
    title: "Analisis Meteorologi Hujan Ekstrem",
    paragraphs: [
      "BMKG menjelaskan adanya penguatan aliran angin dari wilayah utara ekuator menuju kawasan Jawa pada periode kejadian. Aliran udara tersebut berinteraksi dengan angin lain dan mendukung pembentukan daerah pertemuan angin atau konvergensi.",
      "Konvergensi memungkinkan massa udara lembap terkumpul dan terdorong naik. Saat udara naik, suhunya menurun sehingga uap air dapat mengalami kondensasi. Proses tersebut mendukung pertumbuhan awan hujan.",
      "Kondisi Monsun Asia, suhu permukaan laut yang hangat, dan aktivitas gelombang atmosfer turut menjadi bagian dari penjelasan meteorologi cuaca ekstrem pada periode tersebut.",
      "Penting untuk membedakan faktor atmosfer yang menyebabkan hujan dari kondisi lingkungan perkotaan yang menentukan seberapa besar air menggenang setelah mencapai permukaan tanah.",
    ],
  },
  {
    number: "05",
    title: "Data Curah Hujan dan Rekor 2020",
    paragraphs: [
      "Data yang dipublikasikan BNPB dari pengamatan BMKG menunjukkan curah hujan 377 milimeter di TNI AU Halim, 335 milimeter di Taman Mini, dan 259 milimeter di Jatiasih.",
      "Curah hujan 377 milimeter setara dengan 377 liter air pada setiap meter persegi permukaan datar. Angka tersebut menggambarkan banyaknya hujan yang turun, bukan kedalaman genangan banjir di suatu jalan atau rumah.",
      "Nilai hujan yang sangat tinggi menunjukkan besarnya beban air yang harus ditampung atau dialirkan oleh tanah, drainase, dan sungai dalam waktu relatif singkat.",
      "Pengamatan dari lokasi berbeda tidak boleh dianggap sebagai satu pengukuran yang berlaku untuk seluruh Jakarta. Distribusi hujan dapat bervariasi secara signifikan antarwilayah.",
    ],
  },
];


const additionalChapters = [
  {
    number: "06",
    title: "Mekanisme Terjadinya Banjir Perkotaan",
    paragraphs: [
      "Banjir perkotaan terjadi ketika air yang masuk ke suatu wilayah melebihi kemampuan tanah, saluran, sungai, atau sistem pengendalian air untuk menampung dan mengalirkannya. Pada peristiwa Januari 2020, hujan ekstrem meningkatkan jumlah air yang harus ditangani dalam waktu relatif singkat.",
      "Ketika hujan mencapai permukaan tanah, sebagian air meresap melalui proses infiltrasi, sebagian tertahan vegetasi, dan sebagian mengalir di atas permukaan sebagai limpasan. Proporsi setiap proses dipengaruhi intensitas hujan, kondisi tanah, kemiringan lahan, dan penggunaan lahan.",
      "Di kawasan yang didominasi beton, aspal, serta bangunan, kemampuan infiltrasi umumnya lebih rendah dibandingkan lahan bervegetasi dengan kondisi tanah yang mendukung. Akibatnya, limpasan dapat meningkat dan mencapai saluran lebih cepat.",
      "Jika kapasitas drainase tidak mampu menampung debit yang masuk, air dapat menggenang. Jika debit sungai melampaui kapasitas alur, air dapat meluap ke wilayah di sekitarnya. Kedua proses tersebut dapat terjadi bersamaan.",
      "Kedalaman genangan di suatu lokasi tidak dapat disimpulkan langsung dari curah hujan yang tercatat di stasiun pengamatan. Genangan dipengaruhi kondisi topografi, aliran dari wilayah lain, hambatan saluran, dan lamanya air dapat keluar dari kawasan tersebut.",
    ],
  },
  {
    number: "07",
    title: "Peran Sungai, Drainase, dan Daerah Hulu",
    paragraphs: [
      "Jakarta berada pada bagian hilir sejumlah sistem sungai yang menghubungkan wilayah pegunungan di selatan dengan kawasan pesisir utara. Karena itu, pengelolaan banjir Jakarta berkaitan dengan kondisi daerah aliran sungai yang melampaui batas administrasi DKI Jakarta.",
      "Air hujan yang turun di daerah hulu dapat masuk ke anak sungai dan kemudian bergerak menuju alur utama. Ketika hujan juga turun di wilayah hilir, beban aliran dapat meningkat secara bersamaan.",
      "Drainase perkotaan dirancang untuk mengalirkan air dari jalan, permukiman, dan kawasan terbangun menuju saluran yang lebih besar. Namun, kemampuan sistem tersebut memiliki batas. Hujan yang melampaui kapasitas rencana dapat menimbulkan genangan meskipun saluran berfungsi.",
      "Kondisi sedimentasi, sampah, penyempitan saluran, kerusakan infrastruktur, dan hambatan aliran dapat memperburuk masalah di lokasi tertentu. Namun, tidak tepat menyatakan seluruh banjir Januari 2020 semata-mata disebabkan oleh sampah atau saluran tersumbat.",
      "Pintu air, pompa, waduk, dan tanggul merupakan bagian dari sistem pengendalian banjir. Efektivitasnya dipengaruhi kapasitas, kondisi operasional, besarnya debit, serta karakteristik lokasi yang dilindungi.",
    ],
  },
  {
    number: "08",
    title: "Kerentanan Jakarta sebagai Kota Pesisir",
    paragraphs: [
      "Sebagian kawasan Jakarta memiliki elevasi rendah dan berada dekat dengan pesisir Laut Jawa. Di daerah seperti ini, pengaliran air secara gravitasi menuju laut dapat menjadi lebih sulit pada kondisi tertentu.",
      "Pasang air laut dapat memengaruhi pembuangan air di wilayah pesisir. Sementara itu, penurunan muka tanah menjadi persoalan jangka panjang yang meningkatkan kerentanan beberapa kawasan terhadap genangan dan banjir pesisir.",
      "Perubahan tata guna lahan dapat mengurangi ruang terbuka dan kemampuan infiltrasi. Permukaan kedap air juga mempercepat perpindahan limpasan menuju saluran, sehingga pengelolaan air hujan perlu diperhatikan dalam perencanaan kawasan perkotaan.",
      "Kepadatan penduduk dan bangunan meningkatkan jumlah orang, rumah, kendaraan, serta fasilitas yang berpotensi terdampak ketika banjir terjadi. Dengan demikian, risiko bencana tidak hanya ditentukan oleh besarnya bahaya alam, tetapi juga oleh tingkat paparan dan kerentanan masyarakat.",
      "Tidak semua wilayah Jakarta memiliki karakteristik yang sama. Daerah bantaran sungai, dataran rendah, kawasan pesisir, dan lingkungan dengan drainase terbatas dapat menghadapi mekanisme banjir yang berbeda.",
    ],
  },
  {
    number: "09",
    title: "Dampak terhadap Penduduk dan Kehidupan Sosial",
    paragraphs: [
      "Banjir Januari 2020 menyebabkan gangguan besar pada kehidupan masyarakat di berbagai kawasan Jakarta dan sekitarnya. Rumah yang tergenang dapat kehilangan akses listrik, air bersih, fasilitas sanitasi, dan jalur transportasi.",
      "Bagi keluarga yang harus mengungsi, kebutuhan mendesak mencakup tempat aman, makanan, air minum, pakaian, perlengkapan bayi, obat-obatan, dan informasi mengenai kondisi rumah serta lingkungan mereka.",
      "Kelompok rentan seperti anak-anak, lansia, penyandang disabilitas, dan orang yang membutuhkan perawatan kesehatan memerlukan perhatian khusus dalam proses evakuasi maupun pengungsian.",
      "Banjir juga mengganggu aktivitas sekolah, pekerjaan, usaha kecil, dan pelayanan masyarakat. Ketika akses jalan terputus atau kendaraan tidak dapat digunakan, mobilitas penduduk dan distribusi barang dapat terhambat.",
      "Dampak psikologis dapat muncul karena kehilangan harta benda, ketidakpastian situasi, gangguan aktivitas, dan kekhawatiran terhadap keselamatan keluarga. Pemulihan sosial sering membutuhkan waktu lebih lama daripada surutnya air.",
    ],
  },
  {
    number: "10",
    title: "Korban, Pengungsi, dan Dampak Ekonomi",
    paragraphs: [
      "Jumlah korban jiwa, pengungsi, serta lokasi terdampak merupakan informasi penting dalam dokumentasi bencana. Namun, angka tersebut dapat berubah dari satu laporan ke laporan berikutnya karena proses pendataan, pencarian, dan pembaruan informasi terus berlangsung.",
      "Saat menyajikan statistik, perlu dibedakan apakah suatu angka mencakup DKI Jakarta saja, seluruh Jabodetabek, atau wilayah yang lebih luas. Tanggal dan jam pembaruan juga harus dicantumkan agar pembaca tidak salah membandingkan laporan.",
      "Kerugian ekonomi akibat banjir dapat mencakup kerusakan rumah, kendaraan, barang dagangan, fasilitas umum, jalan, peralatan usaha, dan infrastruktur. Selain kerusakan fisik, terdapat potensi kehilangan pendapatan akibat berhentinya kegiatan ekonomi.",
      "Kerugian langsung dan kerugian tidak langsung merupakan dua kategori yang berbeda. Kerusakan bangunan merupakan contoh kerugian langsung, sedangkan kehilangan pendapatan selama usaha tidak beroperasi merupakan contoh kerugian tidak langsung.",
      "Angka korban dan nilai kerugian yang belum disertai sumber, tanggal, dan cakupan wilayah tidak boleh ditampilkan sebagai angka final. Prinsip ini penting agar dokumentasi sejarah tidak mencampurkan statistik dari periode pelaporan yang berbeda.",
    ],
  },
  {
    number: "11",
    title: "Evakuasi dan Penanganan Darurat",
    paragraphs: [
      "Ketika banjir terjadi, prioritas penanganan darurat adalah menyelamatkan manusia. Petugas, relawan, dan masyarakat melakukan evakuasi dari lokasi yang berbahaya menuju tempat yang lebih aman.",
      "Proses evakuasi perlu mempertimbangkan kedalaman air, kekuatan arus, kondisi akses jalan, keberadaan jaringan listrik, serta kebutuhan warga dengan keterbatasan mobilitas.",
      "Posko pengungsian berperan dalam menyediakan perlindungan sementara, distribusi bantuan, informasi, dan layanan dasar. Koordinasi antarinstansi dibutuhkan agar kebutuhan warga dapat teridentifikasi dan ditangani.",
      "Pemantauan prakiraan cuaca, kondisi sungai, serta peringatan dini membantu petugas dan masyarakat mengambil keputusan. Informasi harus disampaikan secara jelas agar warga mengetahui tindakan yang perlu dilakukan.",
      "Pada awal Januari 2020, teknologi modifikasi cuaca digunakan sebagai salah satu upaya penanganan risiko hujan. Upaya ini perlu dipahami sebagai tindakan tambahan, bukan solusi tunggal untuk persoalan banjir perkotaan.",
    ],
  },
  {
    number: "12",
    title: "Pemulihan, Mitigasi, dan Pelajaran Bencana",
    paragraphs: [
      "Setelah banjir surut, proses pemulihan meliputi pembersihan rumah dan lingkungan, pemeriksaan kondisi bangunan, perbaikan fasilitas umum, pemulihan akses transportasi, serta penanganan kebutuhan kesehatan masyarakat.",
      "Mitigasi struktural dapat mencakup pemeliharaan dan peningkatan kapasitas drainase, pengelolaan sungai, waduk, pompa, tanggul, serta infrastruktur pengendali air lain sesuai karakteristik wilayah.",
      "Mitigasi nonstruktural meliputi perencanaan tata ruang, perlindungan daerah resapan, pendidikan kebencanaan, sistem peringatan dini, latihan evakuasi, dan penguatan kesiapsiagaan masyarakat.",
      "Pengelolaan daerah aliran sungai memerlukan kerja sama lintas wilayah karena air yang mengalir menuju Jakarta dapat berasal dari luar batas administrasi kota. Kebijakan di hulu dan hilir perlu dipertimbangkan secara terpadu.",
      "Bagi masyarakat, kesiapsiagaan dapat dimulai dari mengenali risiko lingkungan, mengetahui jalur evakuasi, menyimpan dokumen penting dengan aman, menyiapkan kebutuhan darurat, dan mengikuti informasi resmi ketika cuaca ekstrem diperkirakan terjadi.",
      "Pelajaran utama dari banjir Januari 2020 adalah bahwa hujan ekstrem dapat berubah menjadi bencana besar ketika bertemu dengan paparan dan kerentanan yang tinggi. Pengurangan risiko memerlukan kombinasi ilmu pengetahuan, infrastruktur, tata ruang, kebijakan, dan kesiapan masyarakat.",
    ],
  },
];

// GABUNGKAN BAB 1–5 DAN BAB 6–12
const allChapters = [...chapters, ...additionalChapters];

// KRONOLOGI KEJADIAN
const timeline = [
  {
    date: "31 DES 2019",
    title: "Hujan Menjelang Tahun Baru",
    description:
      "Hujan berlangsung di Jakarta dan wilayah sekitarnya menjelang pergantian tahun.",
  },
  {
    date: "01 JAN 2020",
    title: "Banjir Melanda Jakarta dan Sekitarnya",
    description:
      "Hujan ekstrem meningkatkan limpasan dan debit aliran sehingga berbagai kawasan mengalami banjir.",
  },
  {
    date: "02 JAN 2020",
    title: "Penanganan dan Pendataan Berlanjut",
    description:
      "Evakuasi, pelayanan pengungsian, bantuan darurat, dan pembaruan informasi dampak terus dilakukan.",
  },
  {
    date: "03 JAN 2020",
    title: "Upaya Pengurangan Risiko Hujan",
    description:
      "Operasi teknologi modifikasi cuaca menjadi salah satu langkah tambahan dalam penanganan situasi.",
  },
  {
    date: "AWAL JAN 2020",
    title: "Pemulihan Wilayah Terdampak",
    description:
      "Pembersihan, perbaikan, pendataan kerusakan, dan pemulihan aktivitas masyarakat dilakukan secara bertahap.",
  },
];



export default function DisasterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState<number[]>([0, 1, 2]);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".disaster-reveal").forEach((item) => {
        gsap.fromTo(
          item,
          { y: 55, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              once: true,
            },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  function toggleChapter(index: number) {
    setExpanded((current) =>
      current.includes(index)
        ? current.filter((value) => value !== index)
        : [...current, index]
    );
  }

  return (
    <section
      ref={sectionRef}
      id="disaster"
      className="overflow-hidden bg-[#0a1219] text-[#f4f4ed]"
    >
      <div className="mx-auto max-w-[1600px] px-6 py-28 md:px-12 md:py-40">

        {/* JUDUL UTAMA */}
        <div className="disaster-reveal flex items-center gap-4">
          <span className="h-px w-12 bg-[#9dcbd5]" />
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#9dcbd5]">
            Chapter 01 / The Disaster
          </span>
        </div>

        <h2 className="disaster-reveal mt-12 max-w-6xl text-[clamp(3.5rem,9vw,9rem)] font-black uppercase leading-[0.9] tracking-[-0.075em]">
          WHEN THE
          <br />
          <span className="text-[#9dcbd5]">RAIN</span> DIDN&apos;T
          <br />
          STOP.
        </h2>

        {/* PENGANTAR */}
        <div className="mt-20 grid gap-10 border-t border-white/20 pt-12 md:grid-cols-2">
          <div className="disaster-reveal">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9dcbd5]">
              Jakarta / January 2020
            </p>
            <p className="mt-5 max-w-md text-sm leading-8 text-[#829aa8]">
              Dokumentasi edukatif tentang hujan ekstrem,
              kondisi perkotaan, dan dampak banjir yang
              terjadi pada pergantian tahun 2019–2020.
            </p>
          </div>

          <div className="disaster-reveal">
            <h3 className="text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
              Ketika hujan bertemu dengan kerentanan sebuah kota.
            </h3>
            <p className="mt-8 text-lg leading-9 text-[#a6b6bf]">
              Banjir awal Januari 2020 merupakan salah satu
              peristiwa banjir besar di Jakarta dan wilayah
              sekitarnya. Kejadian ini tidak hanya dipengaruhi
              hujan ekstrem, tetapi juga aliran sungai,
              drainase, karakteristik wilayah, dan tingkat
              kerentanan masyarakat.
            </p>
          </div>
        </div>

        {/* FOTO DOKUMENTASI ASLI JANUARI 2020 */}
        <div id="documentation" className="mt-24">
          <div className="grid overflow-hidden border border-white/15 bg-[#12232e] lg:grid-cols-2">
            <div className="relative min-h-[420px] overflow-hidden bg-[#1c303d]">
              <img
                src="https://commons.wikimedia.org/wiki/Special:FilePath/Banjir_Jakarta_Perumahan_di_Tanjung_Duren_1_Januari_2020.jpg?width=1000"
                alt="Dokumentasi banjir di kawasan perumahan Tanjung Duren, Jakarta Barat, 1 Januari 2020"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="flex flex-col justify-center p-8 md:p-14">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9dcbd5]">
                Historical Documentation / 01.01.2020
              </p>

              <h3 className="mt-6 text-3xl font-bold leading-tight md:text-5xl">
                Ketika permukiman Jakarta terendam.
              </h3>

              <p className="mt-7 text-base leading-9 text-[#a6b6bf]">
                Foto ini memperlihatkan kondisi banjir
                di sebuah kawasan perumahan di Tanjung
                Duren, Jakarta Barat, pada pagi hari
                1 Januari 2020.
              </p>

              <p className="mt-5 text-base leading-9 text-[#a6b6bf]">
                Dokumentasi ini menjadi gambaran nyata
                bagaimana peristiwa hujan ekstrem
                berdampak pada lingkungan tempat tinggal
                masyarakat.
              </p>

              <div className="mt-9 border-t border-white/20 pt-5">
                <p className="text-sm text-[#9dcbd5]">
                  Lokasi: Tanjung Duren, Jakarta Barat
                </p>

                <p className="mt-2 text-xs leading-6 text-[#91a6b2]">
                  Foto: Cun Cun / Wikimedia Commons
                  <br />
                  Tanggal: 1 Januari 2020
                  <br />
                  Lisensi: CC BY-SA 4.0
                </p>

                <a
                  href="https://commons.wikimedia.org/wiki/File:Banjir_Jakarta_Perumahan_di_Tanjung_Duren_1_Januari_2020.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-[#9dcbd5] underline underline-offset-4"
                >
                  Kredit dan lisensi foto
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAKTOR PENYEBAB */}
        <div className="mt-28">
          <div className="disaster-reveal flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9dcbd5]">
                Understanding The Disaster
              </p>
              <h3 className="mt-5 text-4xl font-bold tracking-[-0.05em] md:text-6xl">
                Apa yang memperparah banjir?
              </h3>
            </div>

            <ArrowDownRight
              className="hidden text-[#9dcbd5] md:block"
              size={44}
            />
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {factors.map((factor) => {
              const Icon = factor.icon;

              return (
                <article
                  key={factor.number}
                  className="disaster-reveal min-h-[330px] border border-white/15 bg-[#12232e] p-8 transition-colors hover:bg-[#193848]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#90a7b4]">
                      / {factor.number}
                    </span>
                    <Icon size={30} className="text-[#9dcbd5]" />
                  </div>

                  <h4 className="mt-20 text-2xl font-bold">
                    {factor.title}
                  </h4>

                  <p className="mt-5 leading-8 text-[#a6b6bf]">
                    {factor.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        {/* GRAFIK CURAH HUJAN */}
        <div 
          id="rainfall-data"
        className="mt-32 border-t border-white/15 pt-20">
          <div className="disaster-reveal">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9dcbd5]">
              Measured Rainfall
            </p>

            <h3 className="mt-5 text-4xl font-bold tracking-[-0.05em] md:text-6xl">
              Hujan yang luar biasa.
            </h3>

            <p className="mt-7 max-w-3xl leading-8 text-[#a6b6bf]">
              BNPB mempublikasikan hasil pengamatan curah
              hujan dari BMKG pada kejadian 1 Januari 2020.
              Tiga lokasi berikut mencatat hujan harian
              dengan intensitas sangat tinggi.
            </p>
          </div>

          <div className="mt-12 space-y-9">
            {rainfall.map((item) => (
              <div key={item.place} className="disaster-reveal">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="font-semibold">
                    {item.place}
                  </span>

                  <span className="text-xl font-black text-[#9dcbd5]">
                    {item.value} mm
                  </span>
                </div>

                <div className="h-6 bg-[#243744]">
                  <div
                    className="h-full bg-[#9dcbd5]"
                    style={{
                      width: `${(item.value / 400) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="disaster-reveal mt-12 border-l-2 border-[#9dcbd5] bg-[#12232e] p-8">
            <div className="flex items-center gap-4">
              <CloudRain size={36} className="text-[#9dcbd5]" />
              <p className="text-3xl font-black text-[#9dcbd5] md:text-5xl">
                377 liter/m²
              </p>
            </div>

            <p className="mt-5 max-w-3xl leading-8 text-[#a6b6bf]">
              Curah hujan sebesar 377 milimeter setara
              dengan 377 liter air hujan per meter persegi.
              Angka tersebut menggambarkan jumlah hujan,
              bukan tinggi genangan di rumah atau jalan.
            </p>
          </div>
        </div>

        {/* DIAGRAM METEOROLOGI */}
        <div className="mt-32 border-t border-white/15 pt-20">
          <div className="disaster-reveal">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9dcbd5]">
              Meteorology / Educational Diagram
            </p>

            <h3 className="mt-5 text-4xl font-bold tracking-[-0.05em] md:text-6xl">
              Mengapa hujan begitu ekstrem?
            </h3>

            <p className="mt-7 max-w-3xl leading-8 text-[#a6b6bf]">
              Kondisi atmosfer pada pergantian tahun
              mendukung pembentukan awan hujan. Diagram
              konseptual ini menjelaskan prosesnya secara
              sederhana, bukan menggantikan citra satelit
              pengamatan asli.
            </p>
          </div>

          <div className="disaster-reveal mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Wind,
                title: "01 / Aliran Udara",
                text: "Angin membawa udara lembap menuju wilayah Jawa.",
              },
              {
                icon: Droplets,
                title: "02 / Konvergensi",
                text: "Pertemuan angin mendukung gerakan udara lembap ke atas.",
              },
              {
                icon: CloudRain,
                title: "03 / Awan Hujan",
                text: "Udara naik, mendingin, dan mendukung pembentukan awan hujan.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="border border-[#355464] bg-[#12232e] p-9"
                >
                  <Icon size={40} className="text-[#9dcbd5]" />

                  <h4 className="mt-10 text-2xl font-bold">
                    {item.title}
                  </h4>

                  <p className="mt-5 leading-8 text-[#a6b6bf]">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* KRONOLOGI */}
        <div 
         id="flood-chronology"
        className="mt-32 border-t border-white/15 pt-20">
          <div className="disaster-reveal">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9dcbd5]">
              A Detailed Timeline
            </p>

            <h3 className="mt-5 text-4xl font-bold tracking-[-0.05em] md:text-6xl">
              Hari-hari ketika air datang.
            </h3>

            <p className="mt-7 max-w-3xl leading-8 text-[#a6b6bf]">
              Rangkaian kejadian dari pergantian tahun
              hingga masa penanganan awal banjir.
            </p>
          </div>

          <div className="mt-14 border-t border-white/20">
            {timeline.map((event, index) => (
              <div
                key={`${event.date}-${index}`}
                className="disaster-reveal grid gap-5 border-b border-white/20 py-10 md:grid-cols-[100px_220px_1fr]"
              >
                <span className="text-sm text-[#7894a3]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="font-bold tracking-[0.1em] text-[#9dcbd5]">
                  {event.date}
                </span>

                <div>
                  <h4 className="text-2xl font-bold">
                    {event.title}
                  </h4>

                  <p className="mt-4 max-w-xl leading-8 text-[#a6b6bf]">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BAGIAN 4 AKAN DISAMBUNG DI SINI */}

        {/* DIAGRAM PROSES TERJADINYA BANJIR */}
        <div className="mt-32 border-t border-white/15 pt-20">
          <div className="disaster-reveal">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9dcbd5]">
              Hydrology / Understanding Floods
            </p>

            <h3 className="mt-5 text-4xl font-bold tracking-[-0.05em] md:text-6xl">
              Bagaimana hujan berubah menjadi banjir?
            </h3>

            <p className="mt-7 max-w-3xl leading-8 text-[#a6b6bf]">
              Banjir tidak terbentuk hanya karena air hujan turun.
              Kondisi permukaan tanah, kapasitas saluran, aliran
              sungai, dan topografi menentukan bagaimana air
              bergerak serta di mana genangan terbentuk.
            </p>
          </div>

          <div className="disaster-reveal mt-12 grid gap-4 md:grid-cols-4">
            {[
              {
                number: "01",
                title: "Hujan",
                text: "Air hujan jatuh ke atap, jalan, tanah, dan permukaan kota.",
              },
              {
                number: "02",
                title: "Limpasan",
                text: "Sebagian air tidak meresap dan mengalir menuju kawasan rendah.",
              },
              {
                number: "03",
                title: "Drainase",
                text: "Air masuk ke selokan, kanal, dan jaringan sungai.",
              },
              {
                number: "04",
                title: "Genangan",
                text: "Banjir terjadi ketika air masuk melebihi kapasitas pembuangan atau penampungan.",
              },
            ].map((step) => (
              <article
                key={step.number}
                className="border-t-2 border-[#9dcbd5] bg-[#12232e] p-8"
              >
                <span className="text-sm font-bold text-[#9dcbd5]">
                  {step.number}
                </span>

                <h4 className="mt-12 text-2xl font-bold">
                  {step.title}
                </h4>

                <p className="mt-5 leading-8 text-[#a6b6bf]">
                  {step.text}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-5 text-xs leading-6 text-[#829aa8]">
            Diagram konseptual untuk menjelaskan mekanisme
            banjir perkotaan, bukan rekonstruksi lokasi
            banjir tertentu pada Januari 2020.
          </p>
        </div>

        {/* MATERI MENDALAM 12 BAB */}
        <div 
        id="flood-chapters"
        className="mt-32 border-t border-white/15 pt-20">
          <div className="disaster-reveal">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9dcbd5]">
              In-Depth Documentary / 12 Chapters
            </p>

            <h3 className="mt-5 max-w-5xl text-4xl font-bold tracking-[-0.05em] md:text-6xl">
              Memahami banjir Jakarta 2020 secara mendalam.
            </h3>

            <p className="mt-8 max-w-3xl text-lg leading-9 text-[#a6b6bf]">
              Dua belas pembahasan berikut menguraikan kondisi
              geografis Jakarta, sejarah banjir, kronologi,
              faktor meteorologi, data curah hujan, mekanisme
              banjir, kerentanan kota, dampak sosial dan ekonomi,
              penanganan darurat, hingga strategi mitigasi.
              Seluruh penjelasan dapat dibaca langsung di
              halaman ini.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                setExpanded(allChapters.map((_, index) => index))
              }
              className="rounded-full border border-[#9dcbd5] px-6 py-3 text-sm font-bold text-[#9dcbd5] transition-colors hover:bg-[#9dcbd5] hover:text-[#0a1219]"
            >
              Buka Semua Bab
            </button>

            <button
              type="button"
              onClick={() => setExpanded([])}
              className="rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              Tutup Semua Bab
            </button>
          </div>

          <div className="mt-12 border-t border-white/20">
            {allChapters.map((chapter, index) => {
              const isOpen = expanded.includes(index);

              return (
                <article
                  key={chapter.number}
                  className="border-b border-white/20"
                >
                  <button
                    type="button"
                    onClick={() => toggleChapter(index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start gap-5 py-9 text-left md:gap-10"
                  >
                    <span className="mt-2 shrink-0 text-sm font-bold text-[#9dcbd5]">
                      {chapter.number}
                    </span>

                    <span className="flex-1 text-xl font-bold leading-tight tracking-tight md:text-3xl">
                      {chapter.title}
                    </span>

                    <ChevronDown
                      size={26}
                      className={`shrink-0 text-[#9dcbd5] transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="pb-12 pl-10 md:pl-16">
                      <div className="max-w-4xl space-y-6">
                        {chapter.paragraphs.map(
                          (paragraph, paragraphIndex) => (
                            <p
                              key={`${chapter.number}-${paragraphIndex}`}
                              className="text-base leading-9 text-[#a6b6bf] md:text-lg"
                            >
                              {paragraph}
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        {/* CATATAN PEMBACAAN DATA */}
        <div className="mt-28 grid gap-10 border-t border-white/15 pt-16 md:grid-cols-2">
          <div className="disaster-reveal">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9dcbd5]">
              Understanding The Numbers
            </p>

            <h3 className="mt-5 text-3xl font-bold tracking-tight md:text-5xl">
              Mengapa angka laporan bencana bisa berbeda?
            </h3>
          </div>

          <div className="disaster-reveal space-y-6 text-base leading-9 text-[#a6b6bf]">
            <p>
              Data bencana berkembang selama masa tanggap
              darurat. Jumlah korban, pengungsi, dan wilayah
              terdampak dapat berubah karena petugas terus
              melakukan pendataan dan pembaruan informasi.
            </p>

            <p>
              Perbedaan angka juga dapat disebabkan oleh
              cakupan wilayah. Statistik untuk DKI Jakarta
              tidak otomatis sama dengan statistik untuk
              seluruh Jabodetabek.
            </p>

            <p>
              Karena itu, setiap angka perlu dilengkapi
              tanggal pembaruan, cakupan wilayah, dan sumber.
              Data dari waktu yang berbeda tidak boleh
              digabungkan seolah-olah berasal dari satu
              laporan yang sama.
            </p>
          </div>
        </div>

        {/* DAFTAR SUMBER */}
        <div 
         id="flood-sources"
        className="mt-28 border-t border-white/15 pt-16">
          <div className="disaster-reveal flex items-center gap-3 text-[#9dcbd5]">
            <BookOpen size={24} />
            <span className="text-xs font-bold uppercase tracking-[0.25em]">
              Research / Official Sources
            </span>
          </div>

          <h3 className="disaster-reveal mt-6 text-3xl font-bold tracking-tight md:text-5xl">
            Sumber dan dasar pembahasan.
          </h3>

          <p className="disaster-reveal mt-7 max-w-3xl leading-8 text-[#a6b6bf]">
            Materi disusun sebagai penjelasan edukatif
            dengan mengacu pada publikasi resmi BNPB
            dan BMKG. Grafik curah hujan menggunakan
            angka pengamatan yang dipublikasikan,
            sementara diagram meteorologi dan hidrologi
            merupakan ilustrasi konseptual.
          </p>

          <div className="mt-10 max-w-4xl border-t border-white/15">
            {sources.map((source, index) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-5 border-b border-white/15 py-6 text-[#9dcbd5] transition-colors hover:text-white"
              >
                <div className="flex items-center gap-5">
                  <span className="text-xs text-[#829aa8]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="font-semibold">
                    {source.name}
                  </span>
                </div>

                <ArrowDownRight size={20} className="shrink-0" />
              </a>
            ))}
          </div>

          <p className="mt-10 max-w-3xl border-l-2 border-[#9dcbd5] pl-6 text-sm leading-8 text-[#a6b6bf]">
            Catatan dokumentasi: foto historis, statistik
            korban terperinci, dan data lokasi spesifik
            perlu dilengkapi dengan bukti sumber yang
            sesuai. Materi ini tidak menyamakan ilustrasi
            konseptual dengan foto asli kejadian.
          </p>
        </div>

      </div>
    </section>
  );
}

