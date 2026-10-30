
import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("flood_locations")
      .select(
        "id, event_id, location_name, district, city, latitude, longitude, description"
      )
      .order("id", { ascending: true });

    if (error) {
      console.error("Supabase error:", error.message);

      return NextResponse.json(
        {
          success: false,
          error: "Gagal mengambil data lokasi banjir.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      total: data?.length ?? 0,
      locations: data ?? [],
    });
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}
