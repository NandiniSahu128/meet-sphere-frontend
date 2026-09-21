import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user.model';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Please provide both username and password" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { message: "User Not Found" },
        { status: 404 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      const token = crypto.randomBytes(20).toString("hex");
      user.token = token;
      await user.save();
      return NextResponse.json({ token }, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "Invalid Password" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: `Something went wrong: ${error.message}` },
      { status: 500 }
    );
  }
}
