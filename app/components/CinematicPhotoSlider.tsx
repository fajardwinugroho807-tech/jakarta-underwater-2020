
"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, Expand } from "lucide-react";

const photos = [
  {
    src: "/flood-2020/1.jpg",
    title: "Jakarta Terendam",
    description: "Dokumentasi kondisi banjir pada awal Januari 2020.",
    location: "Jakarta, Indonesia",
    date: "01 JAN 2020",
  },
  {
    src: "/flood-2020/2.jpg",
    title: "Kawasan Permukiman",
    description: "Kondisi permukiman di wilayah terdampak banjir.",
    location: "Jabodetabek",
    date: "JAN 2020",
  },
  {
    src: "/flood-2020/3.jpeg",
    title: "Aktivitas Warga",
    description: "Situasi masyarakat ketika menghadapi genangan banjir.",
    location: "Jabodetabek",
    date: "JAN 2020",
  },
  {
    src: "/flood-2020/4.jpeg",
    title: "Dampak Banjir",
    description: "Kondisi lingkungan setelah hujan ekstrem.",
    location: "Jakarta dan sekitarnya",
    date: "JAN 2020",
  },
];

export default function CinematicPhotoSlider() {
  const [active, setActive] = useState(0);
  const [previousPhoto, setPreviousPhoto] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);

  const photo = photos[active];
  const isAnimating = previousPhoto !== null;

  // ANIMASI SAAT SCROLL
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
      { threshold: 0.1 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  // NAVIGASI THUMBNAIL
  function goToPhoto(index: number) {
    if (isAnimating || index === active) return;

    setDirection(index > active ? 1 : -1);
    setPreviousPhoto(active);
    setActive(index);
  }

  // NAVIGASI PANAH
  function changePhoto(step: number) {
    if (isAnimating) return;

    const nextIndex = (active + step + photos.length) % photos.length;

    setDirection(step);
    setPreviousPhoto(active);
    setActive(nextIndex);
  }

  function next() {
    changePhoto(1);
  }

  function previous() {
    changePhoto(-1);
  }

  return (
    <section
      ref={sectionRef}
      id="cinematic-gallery"
      className="relative overflow-hidden bg-[#080e14] px-6 py-28 text-white md:px-12 md:py-36"
    >
      <div
        className={`mx-auto max-w-[1600px] transition-all duration-1000 ease-out ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-16 opacity-0"
        }`}
      >
        {/* JUDUL GALERI */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-5 flex items-center gap-3 text-[#a8d9e8]">
              <Camera size={18} />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">
                Historical Photo Archive
              </span>
            </div>

            <h2 className="text-5xl font-black uppercase tracking-[-0.07em] md:text-8xl">
              THROUGH
              <br />
              <span className="text-[#a8d9e8]">THE LENS.</span>
            </h2>
          </div>

          <p className="max-w-xs text-sm leading-7 text-slate-400">
            Menelusuri peristiwa banjir Jakarta 2020 melalui
            dokumentasi visual.
          </p>
        </div>

        {/* SLIDER UTAMA */}
        <div className="relative overflow-hidden bg-[#14232d]">
          <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9]">

            {/* FOTO LAMA */}
            {previousPhoto !== null && (
              <img
                src={photos[previousPhoto].src}
                alt=""
                aria-hidden="true"
                className={`absolute inset-0 h-full w-full object-cover ${
                  direction === 1
                    ? "animate-[cinematicSlideOut_900ms_ease-in-out_both]"
                    : "animate-[cinematicSlideOutRight_900ms_ease-in-out_both]"
                }`}
              />
            )}

            {/* FOTO AKTIF */}
            <img
              key={active}
              src={photo.src}
              alt={photo.title}
              onAnimationEnd={(event) => {
                if (event.animationName.startsWith("cinematicSlideIn")) {
                  setPreviousPhoto(null);
                }
              }}
              className={`absolute inset-0 h-full w-full object-cover ${
                isAnimating
                  ? direction === 1
                    ? "animate-[cinematicSlideIn_900ms_ease-in-out_both]"
                    : "animate-[cinematicSlideInLeft_900ms_ease-in-out_both]"
                  : ""
              }`}
            />

            {/* GRADIENT */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20" />

            {/* FULLSCREEN */}
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              aria-label="Perbesar foto"
              className="absolute right-5 top-5 z-10 rounded-full border border-white/40 bg-black/30 p-3 backdrop-blur-md transition hover:bg-white/20"
            >
              <Expand size={20} />
            </button>

            {/* INFORMASI FOTO */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-6 md:p-12">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#b2dce7]">
                <span>{photo.location}</span>
                <span>•</span>
                <span>{photo.date}</span>
              </div>

              <h3
                key={`title-${active}`}
                className="animate-[cinematicCaption_700ms_ease-out_both] text-3xl font-black uppercase tracking-tight md:text-6xl"
              >
                {photo.title}
              </h3>

              <p
                key={`description-${active}`}
                className="mt-4 max-w-xl animate-[cinematicCaption_900ms_ease-out_both] text-sm leading-7 text-slate-200 md:text-base"
              >
                {photo.description}
              </p>
            </div>
          </div>
        </div>

        {/* TOMBOL NAVIGASI */}
        <div className="mt-8 flex items-center justify-between gap-5">
          <div className="text-sm font-semibold tracking-[0.2em] text-[#a8d9e8]">
            {String(active + 1).padStart(2, "0")}
            <span className="mx-3 text-white/30">/</span>
            {String(photos.length).padStart(2, "0")}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={previous}
              disabled={isAnimating}
              aria-label="Foto sebelumnya"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 transition hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-50"
            >
              <ArrowLeft size={22} />
            </button>

            <button
              type="button"
              onClick={next}
              disabled={isAnimating}
              aria-label="Foto berikutnya"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 transition hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-50"
            >
              <ArrowRight size={22} />
            </button>
          </div>
        </div>

        {/* THUMBNAIL FOTO */}
        <div className="mt-8 grid grid-cols-4 gap-2 md:gap-4">
          {photos.map((item, index) => (
            <button
              key={item.src}
              type="button"
              onClick={() => goToPhoto(index)}
              disabled={isAnimating}
              aria-label={`Lihat foto ${index + 1}: ${item.title}`}
              aria-pressed={active === index}
              className={`group relative aspect-[4/3] overflow-hidden rounded-sm border-2 transition-all duration-500 ${
                active === index
                  ? "border-[#a8d9e8] opacity-100"
                  : "border-transparent opacity-50 hover:opacity-100"
              }`}
            >
              <img
                src={item.src}
                alt={item.title}
                className={`h-full w-full object-cover transition-transform duration-700 ${
                  active === index
                    ? "scale-110"
                    : "scale-100 group-hover:scale-110"
                }`}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <div className="absolute bottom-2 left-2 text-left md:bottom-4 md:left-4">
                <span className="text-[10px] font-bold tracking-widest text-[#a8d9e8] md:text-xs">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <p className="hidden text-xs font-semibold uppercase text-white md:block">
                  {item.title}
                </p>
              </div>

              {active === index && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-[#a8d9e8]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* MODE FULLSCREEN */}
      {fullscreen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-5">
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute right-6 top-6 rounded-full border border-white/40 px-5 py-3 text-sm font-bold text-white"
          >
            TUTUP ✕
          </button>

          <img
            src={photo.src}
            alt={photo.title}
            className="max-h-[85vh] max-w-full object-contain"
          />
        </div>
      )}
    </section>
  );
}
