import { NextResponse } from "next/server";
import { MODEL_REGISTRY } from "@/lib/mimo";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({ models: MODEL_REGISTRY });
}
