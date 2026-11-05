"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Educational visual scenario, not a historical reconstruction.
 * The interactive canvas runs inside a standalone local document so
 * existing Tailwind / global CSS cannot deform its scene coordinates.
 */
export default function FloodSimulation() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(1000);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (!event.data || event.data.type !== "JAKARTA_SIM_HEIGHT") return;
      const nextHeight = Number(event.data.height);
      if (Number.isFinite(nextHeight) && nextHeight >= 500 && nextHeight <= 4000) {
        setHeight(Math.ceil(nextHeight) + 6);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <section aria-label="Simulasi ilustratif banjir Jakarta" className="w-full max-w-full">
      <iframe
        ref={iframeRef}
        title="Simulasi interaktif kota isometrik dan genangan air"
        src="/visual/simulasi-banjir-jakarta.html"
        loading="eager"
        className="block w-full rounded-2xl border border-white/15 bg-[#07141f]"
        style={{ height, overflow: "hidden" }}
      />
    </section>
  );
}
