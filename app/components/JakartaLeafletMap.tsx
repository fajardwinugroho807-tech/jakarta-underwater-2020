
"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type FloodLocation = {
  id: number;
  event_id: number | null;
  location_name: string;
  district: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
};

export default function JakartaLeafletMap({
  selected = 0,
  locations = [],
}: {
  selected?: number;
  locations?: FloodLocation[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Buat peta satu kali dan bersihkan saat unmount.
  useEffect(() => {
    const container = containerRef.current;

    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: [-6.2, 106.83],
      zoom: 11,
      scrollWheelZoom: false,
    });

    mapRef.current = map;

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);
    markersRef.current = markerLayer;

    return () => {
      markersRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, []);

  // Perbarui marker saat lokasi atau pilihan berubah.
  useEffect(() => {
    const markerLayer = markersRef.current;

    if (!markerLayer) return;

    markerLayer.clearLayers();

    const selectedLocation = locations[selected];

    locations.forEach((location) => {
      if (
        location.latitude == null ||
        location.longitude == null
      ) {
        return;
      }

      const lat = Number(location.latitude);
      const lng = Number(location.longitude);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return;
      }

      const isSelected = selectedLocation?.id === location.id;

      const marker = L.circleMarker([lat, lng], {
        radius: 10,
        color: "#ffffff",
        fillColor: isSelected ? "#a8d9e8" : "#127a9a",
        fillOpacity: 0.9,
        weight: 2,
      });

      const popup = document.createElement("div");

      const title = document.createElement("strong");
      title.textContent = location.location_name;

      const description = document.createElement("p");
      description.textContent =
        location.description ||
        "Titik perwakilan wilayah administratif Jakarta.";

      const note = document.createElement("small");
      note.textContent =
        "Koordinat perwakilan wilayah, bukan titik kejadian banjir terverifikasi.";

      popup.append(title, description, note);

      marker.bindPopup(popup);
      marker.addTo(markerLayer);
    });
  }, [locations, selected]);

  // Pindahkan kamera saat wilayah dipilih.
  useEffect(() => {
    const map = mapRef.current;
    const location = locations[selected];

    if (
      !map ||
      location?.latitude == null ||
      location?.longitude == null
    ) {
      return;
    }

    const lat = Number(location.latitude);
    const lng = Number(location.longitude);

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      map.flyTo([lat, lng], 12, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [locations, selected]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ zIndex: 0 }}
      aria-label="Peta interaktif wilayah Jakarta"
    />
  );
}
