
"use client";

import { useEffect, useState } from "react";
import { Waves } from "lucide-react";

export default function CinematicLoader() {
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let frame = 0;
    const duration = 1800;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const percentage = Math.min(
        Math.floor((elapsed / duration) * 100),
        100
      );

      setProgress(percentage);

      if (percentage < 100) {
        frame = requestAnimationFrame(animate);
      } else {
        setFinished(true);
      }
    }

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!finished) return;

    const timeout = window.setTimeout(() => {
      setHidden(true);
    }, 850);

    return () => window.clearTimeout(timeout);
  }, [finished]);

  if (hidden) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#080e14] px-6 text-white transition-all duration-700 ease-in-out ${
        finished
          ? "-translate-y-full opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      {/* LOGO */}
      <div className="mb-10 animate-pulse text-[#a8d9e8]">
        <Waves size={50} strokeWidth={1.3} />
      </div>

      {/* TITLE */}
      <h2 className="text-center text-4xl font-black uppercase leading-none tracking-[-0.07em] sm:text-6xl md:text-8xl">
        JAKARTA
        <br />
        <span className="text-[#a8d9e8]">UNDERWATER.</span>
      </h2>

      <p className="mt-6 text-center text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400 sm:text-xs">
        An Interactive Documentary — 2020
      </p>

      {/* PROGRESS */}
      <div className="mt-16 w-full max-w-sm">
        <div className="mb-4 flex items-center justify-between text-xs font-bold tracking-[0.2em] text-[#a8d9e8]">
          <span>LOADING EXPERIENCE</span>
          <span>{progress}%</span>
        </div>

        <div className="h-[2px] w-full overflow-hidden bg-white/15">
          <div
            className="h-full bg-[#a8d9e8] transition-[width] duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="absolute bottom-10 text-[10px] uppercase tracking-[0.3em] text-slate-600">
        Jakarta / January 2020
      </div>
    </div>
  );
}
