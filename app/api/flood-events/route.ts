
import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("flood_events")
      .select("id, event_date, title, description, source_url")
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Supabase error:", error.message);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      total: data?.length ?? 0,
      events: data ?? [],
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
