// app/api/students/[studentId]/route.ts
// (Assuming this is the correct path, though the error mentions src/app/api/user/profile/[studentId]/route.ts.
// The fix applies regardless of the exact path, as long as it's an App Router API route.)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { hashPassword } from "@/lib/password-utils";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth"; // Ensure this path is correct
import * as z from "zod";
import { departments, GENDERS, YEARS, Year } from "@/types"; // Assuming YEARS is defined in types
import { handleFileUpload, deleteFile } from "@/lib/fileUpload";

// Zod schema for validating incoming form data for updating a student
const updateStudentFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters.").optional(),
  firstName: z.string().min(1, "First name is required.").optional(),
  lastName: z.string().min(1, "Last name is required.").optional(),
  email: z.string().email("Invalid email address.").optional(),
  password: z.string().optional().or(z.literal("")), // Empty string means no change
  gender: z.enum(GENDERS).optional().nullable(),
  phone: z.string().optional().nullable(),
  year: z.coerce.number().min(1).max(YEARS[YEARS.length - 1] || 5).optional().nullable() as z.ZodType<Year | null | undefined>,
  department: z.enum(departments).optional().nullable(),
  removePhoto: z.string().transform(val => val === 'true').optional().default('false'), // Default to string 'false'
});

export async function PATCH(
  req: NextRequest,
  // 1. Modify type for params to be a Promise and rename destructured variable
  { params: paramsPromise }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Registrar") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Await the paramsPromise to get the actual params object
    const params = await paramsPromise;

    // 3. Now use the resolved params object
    const studentIdInt = parseInt(params.studentId, 10);
    if (isNaN(studentIdInt)) {
      return NextResponse.json({ error: "Invalid student ID format" }, { status: 400 });
    }

    const formData = await req.formData();
    const rawData: Record<string, any> = {};
    
    for (const [key, value] of formData.entries()) {
      if (key === "photoFile") continue; 

      if (key === 'password' && value === '') {
        continue;
      } else if (typeof value === 'string' && value === '' && ['phone', 'gender', 'department', 'year'].includes(key)) {
          rawData[key] = null; 
      } else if (key === 'year' && typeof value === 'string' && value !== '') {
          const numValue = parseInt(value, 10);
          rawData[key] = isNaN(numValue) ? null : numValue;
      } else {
          rawData[key] = value;
      }
    }
    
    const validationResult = updateStudentFormSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error("Validation Errors (PATCH):", validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    const dataToUpdate: Record<string, any> = {};

    if (validatedData.username) dataToUpdate.username = validatedData.username;
    if (validatedData.email) dataToUpdate.email = validatedData.email;
    
    if (validatedData.firstName || validatedData.lastName) {
        const currentStudentForName = await prisma.user.findUnique({
            where: { id: studentIdInt },
            select: { name: true }
        });
        const nameParts = currentStudentForName?.name?.split(" ") || ["", ""];
        const currentFirstName = nameParts[0];
        const currentLastName = nameParts.slice(1).join(" ");

        const newFirstName = validatedData.firstName ?? currentFirstName;
        const newLastName = validatedData.lastName ?? currentLastName;
        dataToUpdate.name = `${newFirstName} ${newLastName}`.trim();
    }

    if (validatedData.password && validatedData.password.length > 0) {
      if (validatedData.password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters if provided." }, { status: 400 });
      }
      dataToUpdate.password = await hashPassword(validatedData.password);
    }

    if (validatedData.gender !== undefined) dataToUpdate.gender = validatedData.gender;
    if (validatedData.phone !== undefined) dataToUpdate.phone = validatedData.phone;
    if (validatedData.department !== undefined) dataToUpdate.department = validatedData.department;
    if (validatedData.year !== undefined) dataToUpdate.batch = validatedData.year ? String(validatedData.year) : null;

    const existingStudent = await prisma.user.findUnique({ where: { id: studentIdInt }, select: { photo: true, role: true } });
    if (!existingStudent || existingStudent.role !== 'Student') {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const photoFile = formData.get("photoFile") as File | null;
    const removePhotoFlag = validatedData.removePhoto === true;

    if (removePhotoFlag) {
      if (existingStudent.photo) { // Ensure photo exists before trying to delete
        await deleteFile(existingStudent.photo);
      }
      dataToUpdate.photo = null;
    } else if (photoFile && photoFile.size > 0) {
      try {
        if (existingStudent.photo) { // Delete old photo if it exists
           await deleteFile(existingStudent.photo);
        }
        dataToUpdate.photo = await handleFileUpload(photoFile);
      } catch (e: any) {
        console.error("Photo upload error (PATCH):", e);
        return NextResponse.json({ error: e.message || "Photo upload failed" }, { status: 400 });
      }
    }

    if (Object.keys(dataToUpdate).length === 0 && !photoFile && !removePhotoFlag) { 
        return NextResponse.json({ message: "No changes provided." }, { status: 200 });
    }

    const updatedStudent = await prisma.user.update({
      where: { id: studentIdInt },
      data: dataToUpdate,
      select: {
        id: true, name: true, username: true, email: true, gender: true,
        phone: true, photo: true, barcode_id: true, batch: true,
        department: true, role: true, createdAt: true,
      },
    });

    return NextResponse.json(updatedStudent);
  } catch (error: any) {
    console.error("Error updating student:", error);
     if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes('username') && target?.includes('email')) {
            return NextResponse.json({ error: "Username and Email already exist for another user." }, { status: 409 });
        } else if (target?.includes('username')) {
            return NextResponse.json({ error: "Username already exists for another user." }, { status: 409 });
        } else if (target?.includes('email')) {
            return NextResponse.json({ error: "Email already exists for another user." }, { status: 409 });
        }
        return NextResponse.json({ error: "A unique constraint was violated." }, { status: 409 });
    }
    return NextResponse.json(
      { error: "An internal server error occurred while updating student." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  // 1. Modify type for params to be a Promise and rename destructured variable
  { params: paramsPromise }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Registrar") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Await the paramsPromise to get the actual params object
    const params = await paramsPromise;
    
    // 3. Now use the resolved params object
    const studentIdInt = parseInt(params.studentId, 10);
    if (isNaN(studentIdInt)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    const student = await prisma.user.findUnique({
      where: { id: studentIdInt },
    });

    if (!student || student.role !== 'Student') {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    
    if (student.photo) { // Ensure photo exists before trying to delete
        await deleteFile(student.photo);
    }

    await prisma.user.delete({
      where: { id: studentIdInt },
    });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}