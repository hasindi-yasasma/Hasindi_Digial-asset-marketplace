import { NextResponse } from "next/server";
import { fetchDashboardStats } from "@/services/blockchain";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await fetchDashboardStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
