import ArchiveLayout from "../../components/ArchiveLayout";
import FloodDashboard from "../../components/FloodDashboard";
import FloodMap from "../../components/FloodMap";
import HistoricalFloodMap from "../../components/HistoricalFloodMap";
import CinematicPhotoSlider from "../../components/CinematicPhotoSlider";
import FloodSimulation from "../../components/FloodSimulation";
export function generateStaticParams(){return ["peta","dashboard","galeri","simulasi"].map(mode=>({mode}))}
export default async function Page({params}:{params:Promise<{mode:string}>}){const {mode}=await params;return <ArchiveLayout><div className="mx-auto max-w-6xl"><p className="mb-3 text-xs uppercase tracking-[.3em] text-[#a8d9e8]">Eksplorasi / {mode}</p><h1 className="mb-8 text-4xl font-black uppercase md:text-6xl">{mode==="peta"?"Peta Wilayah Terdampak":mode==="dashboard"?"Dashboard Statistik":mode==="galeri"?"Galeri Dokumentasi":mode==="simulasi"?"Simulasi Banjir":"Halaman Tidak Ditemukan"}</h1>{mode==="peta"?<><p className="mb-5 text-slate-300">Peta interaktif dari project lama. Validasi sumber dan tanggal tiap marker sebelum menyebutnya data historis.</p><HistoricalFloodMap/></>:mode==="dashboard"?<FloodDashboard/>:mode==="galeri"?<CinematicPhotoSlider/>:mode==="simulasi"?<FloodSimulation/>:<p>Menu tidak ditemukan.</p>}</div></ArchiveLayout>}
