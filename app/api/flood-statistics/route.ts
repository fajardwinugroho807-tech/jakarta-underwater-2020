
import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("flood_statistics")
      .select(
        "id, recorded_date, rainfall_mm, evacuee_count, affected_households, notes, source_url"
      )
      .order("recorded_date", { ascending: true });

    if (error) {
      console.error("Supabase error:", error.message);

      return NextResponse.json(
        {
          success: false,
          error: "Gagal mengambil statistik banjir.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      total: data?.length ?? 0,
      statistics: data ?? [],
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
