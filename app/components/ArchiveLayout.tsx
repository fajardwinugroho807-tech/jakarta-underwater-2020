import type { ReactNode } from "react";
import DocumentarySidebar from "./DocumentarySidebar";

/**
 * Halaman materi/eksplorasi memakai sidebar hamburger yang SAMA
 * dengan homepage. Tidak ada lagi kolom sidebar permanen.
 */
export default function ArchiveLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080e14] text-white">
      <DocumentarySidebar />
      <main className="mx-auto w-full px-5 pb-16 pt-28 sm:px-8 md:px-12 md:pt-32">
        {children}
      </main>
    </div>
  );
}
