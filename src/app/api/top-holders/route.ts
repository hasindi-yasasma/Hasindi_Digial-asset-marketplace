import { NextResponse } from "next/server";
import { fetchTopHolders } from "@/services/blockchain";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const holders = await fetchTopHolders();
    return NextResponse.json(holders);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch top holders" },
      { status: 500 }
    );
  }
}
