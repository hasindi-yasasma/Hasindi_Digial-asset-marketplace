import { NextRequest, NextResponse } from "next/server";
import { fetchOwnershipHistory } from "@/services/blockchain";

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
    const history = await fetchOwnershipHistory(tokenId);
    return NextResponse.json(history);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch ownership history" },
      { status: 500 }
    );
  }
}
