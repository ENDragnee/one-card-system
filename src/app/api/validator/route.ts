// app/api/validator/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Adjust path if needed
import prisma from '@/lib/prisma';
import * as z from 'zod';
import { yearMap } from '@/types';
import { Check, Role } from '@prisma/client';

const validatorSchema = z.object({
  barcode_id: z.string().min(1, "Barcode ID cannot be empty."),
});

export async function POST(request: NextRequest) {
  // --- AUTHORIZATION CHECK ---
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized: Not logged in." }, { status: 401 });
  }

  if (session.user?.role !== Role.Registrar) {
    return NextResponse.json({ message: "Forbidden: Insufficient permissions." }, { status: 403 });
  }
  // --- END OF AUTHORIZATION CHECK ---

  try {
    const body = await request.json();
    const validation = validatorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid input.", errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    // ... (rest of the logic remains the same)
    const { barcode_id } = validation.data;

    const user = await prisma.user.findFirst({
      where: { barcode_id: barcode_id },
      select: { id: true, name: true, username: true, photo: true, department: true, batch: true, email: true, completed: true }
    });

    if (!user) {
      return NextResponse.json({ message: "No student found with this barcode ID." }, { status: 404 });
    }
    
    const userData = { ...user, yearLabel: user.batch ? yearMap[parseInt(user.batch)] || "N/A" : "N/A" };
    const lastCheck = await prisma.checkOut.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (lastCheck && lastCheck.status === Check.Entered) {
      return NextResponse.json({ actionStatus: 'ALREADY_ENTERED', message: 'This user has already been checked in.', user: userData }, { status: 200 });
    } else {
      await prisma.checkOut.create({ data: { userId: user.id, status: Check.Entered } });
      return NextResponse.json({ actionStatus: 'CHECKED_IN', message: 'User successfully checked in.', user: userData }, { status: 200 });
    }

  } catch (error) {
    console.error("Validator API Error:", error);
    return NextResponse.json({ message: "An unexpected error occurred on the server." }, { status: 500 });
  }
}