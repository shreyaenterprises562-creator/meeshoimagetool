import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";

export async function POST(req: Request) {
  // yahan file save hogi
  return NextResponse.json({ success: true });
}
