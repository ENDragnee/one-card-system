// @/app/api/user/change-password/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Correct path to authOptions
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password-utils";
import * as z from "zod";

const changePasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validation.error.format() },
        { status: 400 }
      );
    }

    const { newPassword } = validation.data;
    const userId = parseInt(session.user.id, 10); // Prisma expects Int for ID

    if (isNaN(userId)) {
        return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        changedPassword: true,
        changedPasswordAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}