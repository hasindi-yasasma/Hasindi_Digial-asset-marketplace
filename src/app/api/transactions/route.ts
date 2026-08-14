import { NextResponse } from "next/server";
import { fetchAllTransactions } from "@/services/blockchain";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const transactions = await fetchAllTransactions();
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
