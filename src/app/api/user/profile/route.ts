// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";
import path from "path"; // Not strictly needed here if handleFileUpload manages paths
import { writeFile, mkdir, stat, unlink } from "fs/promises"; // Not strictly needed if using handleFileUpload
import { v4 as uuidv4 } from "uuid"; // Potentially used in handleFileUpload
import { Role } from "@prisma/client"; // Keep if you use it
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateBarcode } from "@/lib/barcodeGenerator";
import { hashPassword } from "@/lib/password-utils";
import { handleFileUpload, deleteFile } from "@/lib/fileUpload"; // Ensure this path is correct
import { departments, GENDERS, YEARS as YEAR_LEVELS, Year } from "@/types"; // Renamed YEARS to YEAR_LEVELS for clarity
import { now } from "next-auth/client/_utils";

// Zod schema for updating the current user's profile (PATCH)
const updateUserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  phone: z.string().optional().or(z.literal("")).transform(val => val === "" ? null : val),
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  gender: z.enum(GENDERS, { // Use GENDERS from types if it's ["male", "female", "other"]
    errorMap: () => ({ message: "Please select a valid gender." }),
  }),
  department: z.enum(departments).optional().nullable(), // department is optional for own profile update
});

// Zod schema for creating a new student (POST by admin)
const createStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  phone: z.string().optional().or(z.literal("")).transform(val => val === "" ? null : val),
  gender: z.enum(GENDERS, {
    errorMap: () => ({ message: "Please select a valid gender." }),
  }).optional().nullable(),
  department: z.enum(departments).optional().nullable(),
  // 'year' in the frontend form corresponds to 'batch' in the DB.
  // The frontend sends 'year' as a number (e.g., 1, 2, 3), which needs to be stored as a string in 'batch'.
  year: z.string().transform(val => val === "" ? null : val).pipe(z.coerce.number().min(1).max(YEAR_LEVELS[YEAR_LEVELS.length - 1] || 5).optional().nullable()) as unknown as z.ZodType<Year | null | undefined>,
  // photoFile will be handled separately from formData
});


async function getCurrentUser(req: NextRequest): Promise<{ id: number; role: Role } | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id && session?.user?.role) {
    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id;
    if (!isNaN(userId)) {
      return { id: userId, role: session.user.role as Role };
    }
  }
  return null;
}

// PATCH handler for current user's own profile update
export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = currentUser.id;

    const formData = await req.formData();
    
    const dataFromForm = {
      firstName: formData.get("firstName") as string | null,
      lastName: formData.get("lastName") as string | null,
      phone: formData.get("phone") as string | null,
      email: formData.get("email") as string | null,
      gender: formData.get("gender") as "male" | "female" | "other" | null, // Adjust if GENDERS from types is different
      department: formData.get("department") as typeof departments[number] | null,
    };

    const validationResult = updateUserProfileSchema.safeParse(dataFromForm);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input for profile update", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone, email, gender, department } = validationResult.data;

    const dataToUpdate: {
      name: string;
      email: string;
      phone?: string | null;
      gender?: typeof GENDERS[number] | null; // Use GENDERS type
      photo?: string | null;
      department?: typeof departments[number] | null;
      completed: boolean;
      completedAt?: Date | null; // Not used in this context
      // barcode_id for own profile update? Typically generated once.
    } = {
      name: `${firstName} ${lastName}`.trim(),
      email,
      gender: gender || null,
      phone,
      department: department || null,
      completed: true,
      completedAt: new Date(),
    };

    const pictureFile = formData.get("picture") as File | null; // Assuming 'picture' for own profile
    const removePictureFlag = formData.get("removePicture") === "true";

    const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { photo: true } });
    const oldPhotoPath = userRecord?.photo;

    if (removePictureFlag) {
        dataToUpdate.photo = null;
        if (oldPhotoPath) await deleteFile(oldPhotoPath);
    } else if (pictureFile && pictureFile.size > 0) {
      try {
        if (oldPhotoPath) await deleteFile(oldPhotoPath);
        dataToUpdate.photo = await handleFileUpload(pictureFile); // Generic upload dir
      } catch (e: any) {
        return NextResponse.json({ error: e.message || "Photo upload failed" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, name: true, username: true, email: true, gender: true, phone: true, photo: true, department: true, role: true, createdAt: true, batch: true, barcode_id: true },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error updating profile (PATCH):", error);
    if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes('email')) return NextResponse.json({ error: "Email already in use." }, { status: 409 });
        if (target?.includes('username')) return NextResponse.json({ error: "Username already in use." }, { status: 409 });
        return NextResponse.json({ error: "A unique field conflict occurred." }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error during profile update." }, { status: 500 });
  }
}

// GET handler to fetch all students (Registrar only)
export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser || currentUser.role !== Role.Registrar) { // Use Role enum from Prisma
      return NextResponse.json({ error: "Unauthorized to view students" }, { status: 403 });
    }

    const students = await prisma.user.findMany({
      where: { role: Role.Student },
      select: { 
          id: true, name: true, username: true, email: true, gender: true, 
          phone: true, photo: true, barcode_id: true, batch: true, // batch stores year as string
          department: true, role: true, createdAt: true 
      },
      orderBy: { createdAt: "desc" },
    });
    
    // Map 'batch' (string from DB) to 'year' (number for frontend consistency)
    const processedStudents = students.map(s => ({
        ...s,
        year: s.batch ? parseInt(s.batch, 10) : null
    }));

    return NextResponse.json(processedStudents);
  } catch (error) {
    console.error("Error fetching students (GET):", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

// POST handler for creating a new student (Registrar only)
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser || currentUser.role !== Role.Registrar) {
      return NextResponse.json({ error: "Unauthorized to create student" }, { status: 403 });
    }

    const formData = await req.formData();
    const rawData: Record<string, any> = {};
    
    for (const [key, value] of formData.entries()) {
      if (key === "photoFile") continue; // photoFile is from the student form

      if (typeof value === 'string' && value === '' && ['phone', 'gender', 'department', 'year'].includes(key)) {
          rawData[key] = null;
      } else {
          rawData[key] = value; // 'year' will be string here, Zod will coerce
      }
    }
    // Add default for removePhoto if not present, though not used in createStudentSchema
    if (!rawData.hasOwnProperty('removePhoto')) {
        rawData.removePhoto = 'false';
    }


    const validationResult = createStudentSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error("Validation Errors (POST create student):", JSON.stringify(validationResult.error.flatten().fieldErrors, null, 2));
      return NextResponse.json(
        { error: "Invalid input for new student", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, username, email, password, gender, phone, year, department } = validationResult.data;

    // Check for existing user by username or email (Prisma handles this with unique constraints too)
    const existingUser = await prisma.user.findFirst({
        where: { OR: [{email}, {username}]}
    });
    if (existingUser) {
        if (existingUser.email === email) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        if (existingUser.username === username) return NextResponse.json({ error: "Username already in use" }, { status: 409 });
    }


    const hashedPassword = await hashPassword(password);
    const photoFileFromForm = formData.get("photoFile") as File | null; // Key used in StudentFormModal
    let photoPath: string | null = null;

    if (photoFileFromForm && photoFileFromForm.size > 0) {
      try {
        // Use the generic handleFileUpload, which should save to a general user photo dir or student-specific if customized
        photoPath = await handleFileUpload(photoFileFromForm);
      } catch (e: any) {
        return NextResponse.json({ error: e.message || "Photo upload failed for new student" }, { status: 400 });
      }
    }
    
    const newStudentData: any = {
      name: `${firstName} ${lastName}`.trim(),
      username,
      email,
      password: hashedPassword,
      gender: gender || null,
      phone: phone || null,
      photo: photoPath,
      department: department || null,
      role: Role.Student, // Explicitly set role using Prisma enum
      barcode_id: generateBarcode(),
    };
    if (year !== null && year !== undefined) {
        newStudentData.batch = String(year); // Store 'year' from form as 'batch' (string) in DB
    } else {
        newStudentData.batch = null;
    }
    
    const newStudent = await prisma.user.create({
      data: newStudentData,
      select: {
        id: true, name: true, username: true, email: true, gender: true,
        phone: true, photo: true, barcode_id: true, batch: true,
        department: true, role: true, createdAt: true,
      },
    });
     // Map 'batch' back to 'year' for frontend consistency if Student type expects 'year'
     const responseStudent = {
        ...newStudent,
        year: newStudent.batch ? parseInt(newStudent.batch, 10) : null
    };


    return NextResponse.json(responseStudent, { status: 201 });

  } catch (error: any) {
    console.error("Error creating student (POST):", error);
     if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes('username') && target?.includes('email')) return NextResponse.json({ error: "Username and Email already exist." }, { status: 409 });
        if (target?.includes('username')) return NextResponse.json({ error: "Username already exists." }, { status: 409 });
        if (target?.includes('email')) return NextResponse.json({ error: "Email already exists." }, { status: 409 });
        return NextResponse.json({ error: "A unique field conflict occurred." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}