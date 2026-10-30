
"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
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

function MapController({
  selectedLocation,
}: {
  selectedLocation: FloodLocation | undefined;
}) {
  const map = useMap();

  useEffect(() => {
    if (
      selectedLocation?.latitude == null ||
      selectedLocation?.longitude == null
    ) {
      return;
    }

    map.flyTo(
      [
        Number(selectedLocation.latitude),
        Number(selectedLocation.longitude),
      ],
      12,
      {
        animate: true,
        duration: 1.5,
      }
    );
  }, [selectedLocation, map]);

  return null;
}

export default function JakartaLeafletMap({
  selected = 0,
  locations = [],
}: {
  selected?: number;
  locations?: FloodLocation[];
}) {
  const validLocations = locations.filter(
    (location) =>
      location.latitude !== null &&
      location.longitude !== null &&
      Number.isFinite(Number(location.latitude)) &&
      Number.isFinite(Number(location.longitude)) &&
      Number(location.latitude) >= -90 &&
      Number(location.latitude) <= 90 &&
      Number(location.longitude) >= -180 &&
      Number(location.longitude) <= 180
  );

  const selectedLocation = locations[selected];

  return (
    <MapContainer
      center={[-6.2, 106.83]}
      zoom={11}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController selectedLocation={selectedLocation} />

      {validLocations.map((location) => (
        <CircleMarker
          key={location.id}
          center={[
            Number(location.latitude),
            Number(location.longitude),
          ]}
          radius={10}
          pathOptions={{
            color: "#ffffff",
            fillColor:
              selectedLocation?.id === location.id
                ? "#a8d9e8"
                : "#127a9a",
            fillOpacity: 0.9,
            weight: 2,
          }}
        >
          <Popup>
            <strong>{location.location_name}</strong>
            <p>
              {location.description ||
                "Titik perwakilan wilayah administratif Jakarta."}
            </p>
            <small>
              Koordinat perwakilan wilayah, bukan titik
              kejadian banjir terverifikasi.
            </small>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
