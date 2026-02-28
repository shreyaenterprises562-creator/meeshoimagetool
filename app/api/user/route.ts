import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function GET() {
  await connectDB();

  const user = await User.findOne({ email: "test@gmail.com" });

  return Response.json(user);
}
