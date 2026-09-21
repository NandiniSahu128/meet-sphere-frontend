import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user.model';
import { Meeting } from '@/lib/models/meeting.model';

export async function POST(request) {
  try {
    const { token, meeting_code } = await request.json();

    if (!token || !meeting_code) {
      return NextResponse.json(
        { message: "Token and meeting code are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ token });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const newMeeting = new Meeting({
      user_id: user.username,
      meetingCode: meeting_code,
    });

    await newMeeting.save();

    return NextResponse.json(
      { message: "Added code to history" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `Something went wrong: ${error.message}` },
      { status: 500 }
    );
  }
}
