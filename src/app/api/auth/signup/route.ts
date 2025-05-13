// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password-utils'; // Ensure this utility exists
import * as z from 'zod';
import { Role } from '@prisma/client';

// Zod schema for input validation
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(), // Optional name
  username: z.string()
    .min(3, "Username must be at least 3 characters long.")
    .regex(/^[a-zA-Z0-9_/]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, username, email, password } = validation.data;

    // Check if username or email already exists
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUserByUsername) {
      return NextResponse.json(
        { message: "Username already exists." },
        { status: 409 } // Conflict
      );
    }

    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUserByEmail) {
      return NextResponse.json(
        { message: "Email already registered." },
        { status: 409 } // Conflict
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the new user (role defaults to Student as per Prisma schema)
    const newUser = await prisma.user.create({
      data: {
        name: name || null, // Handle optional name
        username,
        email,
        password: hashedPassword,
        role: Role.Student, // Explicitly set, though it's the default
      },
    });

    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { message: "User registered successfully!", user: userWithoutPassword },
      { status: 201 }
    );

  } catch (error) {
    console.error("Signup Error:", error);
    // Check for Prisma unique constraint violation if Zod validation somehow missed it
    // or if there's a race condition (though less likely with sequential checks).
    // PrismaClientKnownRequestError P2002 is for unique constraint failures.
    if (error instanceof Error && (error as any).code === 'P2002') {
         return NextResponse.json({ message: "Username or email already exists." }, { status: 409 });
    }
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}