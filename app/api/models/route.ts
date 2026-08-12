import { NextResponse } from "next/server";
import { MODEL_REGISTRY } from "@/lib/mimo";

export async function GET() {
  return NextResponse.json({ models: MODEL_REGISTRY });
}
