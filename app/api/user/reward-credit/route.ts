import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST() {
  await connectDB();

  const email = "demo@gmail.com";

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  user.credits += 1;
  await user.save();

  return NextResponse.json({
    success: true,
    credits: user.credits,
  });
}
