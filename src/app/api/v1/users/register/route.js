import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user.model';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const { name, username, password } = await request.json();

    if (!name || !username || !password) {
      return NextResponse.json(
        { message: "Please fill all fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User Registered Successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `Something went wrong: ${error.message}` },
      { status: 500 }
    );
  }
}
