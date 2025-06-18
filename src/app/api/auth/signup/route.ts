// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password-utils';
import * as z from 'zod';
import { Role } from '@prisma/client';
import { generateBarcode } from '@/lib/barcodeGenerator';
// --- UPDATED IMPORT ---
import { departments, yearMap, GENDERS } from '@/types'; // Import shared constants

// --- UPDATED ZOD SCHEMA ---
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string()
    .min(3, "ID must be at least 3 characters long.")
    .regex(/^[a-zA-Z0-9_/]+$/, "ID can only contain letters, numbers, and underscores."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  // Add new fields for validation
  phone: z.string().optional().or(z.literal("")),
  department: z.enum(departments),
  year: z.string().refine(val => Object.keys(yearMap).includes(val)),
  gender: z.enum(GENDERS),
});


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid input.", errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // --- DESTRUCTURE NEW FIELDS ---
    const { name, username, email, password, phone, department, year, gender } = validation.data;

    // Check if username or email already exists
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUserByUsername) {
      return NextResponse.json(
        { message: "ID already exists." },
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

    const hashedPassword = await hashPassword(password);

    // --- UPDATED PRISMA CREATE CALL ---
    const newUser = await prisma.user.create({
      data: {
        name: name,
        username,
        email,
        password: hashedPassword,
        phone: phone || null, // Store empty string as null
        department,
        batch: year, // Map frontend 'year' to database 'batch' field
        gender,
        role: Role.Student,
        barcode_id: generateBarcode(),
        completed: true,
        completedAt: new Date(),
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { message: "User registered successfully!", user: userWithoutPassword },
      { status: 201 }
    );

  } catch (error) {
    console.error("Signup Error:", error);
    if (error instanceof Error && (error as any).code === 'P2002') {
         return NextResponse.json({ message: "ID or email already exists." }, { status: 409 });
    }
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}