import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  // TEMP: replace with real login email later
  const email = "demo@gmail.com";

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({ email, credits: 3 });
  }

  return NextResponse.json({
    credits: user.credits,
  });
}
