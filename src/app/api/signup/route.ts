import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword } from '@/lib/password-utils';

interface SignupRequestBody {
  universityName: string;
  password: string;
}

export async function POST(req: Request) {
  try {
    const body: SignupRequestBody = await req.json();
    // Hash the password
    const hashedPassword = await hashPassword(body.password);

    // Insert the university into the database
    const [result] = await db.execute(
      'INSERT INTO university (name, password) VALUES (?, ?)', 
      [body.universityName, hashedPassword]
    );
    
    // Ensure the result contains the inserted ID (if needed)
    return NextResponse.json(
      { message: 'University created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
