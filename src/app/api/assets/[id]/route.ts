import { NextRequest, NextResponse } from "next/server";
import { fetchAssetById } from "@/services/blockchain";

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tokenId = parseInt(params.id, 10);
    if (isNaN(tokenId)) {
      return NextResponse.json({ error: "Invalid token ID" }, { status: 400 });
    }
    const asset = await fetchAssetById(tokenId);
    return NextResponse.json(asset);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Asset not found" },
      { status: 404 }
    );
  }
}
