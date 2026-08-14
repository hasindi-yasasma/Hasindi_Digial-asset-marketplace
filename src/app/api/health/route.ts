import { NextResponse } from "next/server";
import { checkBlockchainHealth } from "@/services/blockchain";

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await checkBlockchainHealth();
  return NextResponse.json(status);
}
