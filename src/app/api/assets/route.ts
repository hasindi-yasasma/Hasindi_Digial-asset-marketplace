import { NextResponse } from "next/server";
import { fetchAllAssets } from "@/services/blockchain";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const assets = await fetchAllAssets();
    return NextResponse.json(assets);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch assets from blockchain" },
      { status: 500 }
    );
  }
}
