
"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function updateScroll() {
      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const percentage =
        scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      setProgress(Math.min(100, Math.max(0, percentage)));
      setShowTop(scrollTop > 600);
    }

    updateScroll();

    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);

    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <>
      {/* PROGRESS BAR */}
      <div className="pointer-events-none fixed left-0 top-0 z-[100] h-[3px] w-full">
        <div
          className="h-full bg-[#a8d9e8] shadow-[0_0_12px_#a8d9e8]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* BACK TO TOP */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Kembali ke atas"
        className={`fixed bottom-7 right-7 z-[90] flex h-12 w-12 items-center justify-center rounded-full border border-[#a8d9e8]/50 bg-[#10212c] text-[#a8d9e8] shadow-xl transition-all duration-300 hover:bg-[#a8d9e8] hover:text-[#080e14] ${
          showTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-5 opacity-0"
        }`}
      >
        <ArrowUp size={20} />
      </button>
    </>
  );
}

