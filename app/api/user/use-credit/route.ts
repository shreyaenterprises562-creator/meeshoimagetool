import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST() {
  await connectDB();

  const email = "demo@gmail.com";

  const user = await User.findOne({ email });

  if (!user || user.credits <= 0) {
    return NextResponse.json(
      { error: "No credits left" },
      { status: 400 }
    );
  }

  user.credits -= 1;
  await user.save();

  return NextResponse.json({
    success: true,
    credits: user.credits,
  });
}
