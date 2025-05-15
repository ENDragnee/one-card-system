// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Your Prisma client instance
import * as z from "zod";
import path from "path";
import { writeFile, mkdir, stat, unlink } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateBarcode } from "@/lib/barcodeGenerator";
import { hashPassword } from "@/lib/password-utils"; // Assuming you have a hashPassword function
import { handleFileUpload } from "@/lib/fileUpload"; // Assuming you have a file upload utility
import { departments } from "@/types";



// If you use NextAuth.js:
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path to your authOptions

// Zod schema for validating the incoming form data (excluding the file)
const updateUserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  phone: z.string().optional().or(z.literal("")).transform(val => val === "" ? null : val), // Transform empty string to null
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Please select a valid gender." }),
  }),
  department: z.string().optional().or(z.literal("")).transform(val => val === "" ? null : val), // Transform empty string to null
});

const createStudentSchema = z.object({
  firstName: z.string().min(1, "Full name is required."),
  lastName: z.string().min(1, "Full name is required."),
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  phone: z.string().optional().or(z.literal("")).transform(val => val === "" ? null : val), // Transform empty string to null
  gender: z.enum(["male", "female" ], {
    errorMap: () => ({ message: "Please select a valid grnder." }),
  }),
  department: z.enum(departments, {
    errorMap: () => ({ message: "Please select a valid department." }),
  }),
  batch: z.string().optional().or(z.literal("")).transform(val => val === "" ? null : val), // Transform empty string to null
});

// --- AUTHENTICATION PLACEHOLDER ---
// Replace this with your actual function to get the authenticated user's ID
async function getCurrentUserId(req: NextRequest): Promise<number | null> {
//   Example with NextAuth.js (ensure authOptions is correctly configured):
  const session = await getServerSession(authOptions);
  if (session?.user?.id && typeof session.user.id === 'string') {
    const userIdInt = parseInt(session.user.id, 10);
    if (!isNaN(userIdInt)) return userIdInt;
  } else if (session?.user?.id && typeof session.user.id === 'number') {
    return session.user.id;
  }
  return null;

}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    
    const dataFromForm = {
      firstName: formData.get("firstName") as string | null,
      lastName: formData.get("lastName") as string | null,
      phone: formData.get("phone") as string | null,
      email: formData.get("email") as string | null,
      gender: formData.get("gender") as "male" | "female" | null,
      department: formData.get("department") as string | null,
    };

    const validationResult = updateUserProfileSchema.safeParse(dataFromForm);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone, email, gender, department } = validationResult.data;

    const dataToUpdate: {
      name: string;
      email: string;
      phone?: string | null;
      gender: "male" | "female";
      photo?: string | null; // Allow setting photo to null for removal
      barcode_id: string;
      department?: string;
    } = {
      name: `${firstName} ${lastName}`.trim(),
      email,
      gender,
      phone, // Already transformed to null if empty by Zod
      barcode_id: generateBarcode(),
      department: department || "Freshman", // Transform empty string to null
    };

    const pictureFile = formData.get("picture") as File | null;
    const removePictureFlag = formData.get("removePicture") === "true"; // For explicitly removing picture

    const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { photo: true } });
    const oldPhotoPath = currentUser?.photo;


    if (removePictureFlag) {
        dataToUpdate.photo = null;
        if (oldPhotoPath) {
            const oldFilePath = path.join(process.cwd(), "public", oldPhotoPath);
            try {
                await stat(oldFilePath); // Check if file exists
                await unlink(oldFilePath); // Delete old file
            } catch (e) {
                // console.warn(`Old photo not found or could not be deleted: ${oldFilePath}`, e);
            }
        }
    } else if (pictureFile && pictureFile.size > 0) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(pictureFile.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only JPG, PNG, GIF, WEBP are allowed." },
          { status: 400 }
        );
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (pictureFile.size > maxSize) {
        return NextResponse.json(
          { error: `File size exceeds limit of ${maxSize / (1024 * 1024)}MB.` },
          { status: 400 }
        );
      }

      const bytes = await pictureFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Sanitize filename and make it unique
      const fileExtension = path.extname(pictureFile.name);
      const safeOriginalName = pictureFile.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_.-]/g, '_');
      const filename = `${safeOriginalName}-${uuidv4()}${fileExtension}`;
      
      const uploadDir = path.join(process.cwd(), "public", "uploads", "user-photos");
      await mkdir(uploadDir, { recursive: true });
      
      const newFilePath = path.join(uploadDir, filename);
      await writeFile(newFilePath, buffer);

      dataToUpdate.photo = `/uploads/user-photos/${filename}`; // Store relative path

      // Delete old photo if a new one is uploaded and an old one exists
      if (oldPhotoPath && oldPhotoPath !== dataToUpdate.photo) {
        const oldFullFilePath = path.join(process.cwd(), "public", oldPhotoPath);
        try {
          await stat(oldFullFilePath);
          await unlink(oldFullFilePath);
        } catch (e) {
          // console.warn(`Old photo not found or could not be deleted: ${oldFullFilePath}`, e);
        }
      }
    }
    // If no new picture, no remove flag, and no pictureFile with size > 0, photo field is not changed in dataToUpdate unless already set to null.

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    const { password, ...userWithoutSensitiveData } = updatedUser;

    return NextResponse.json({
      message: "Profile updated successfully",
      user: userWithoutSensitiveData,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error updating profile:", error);
    if (error.code === 'P2002') { // Prisma unique constraint violation
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes('email')) {
            return NextResponse.json({ error: "Email already in use by another account." }, { status: 409 });
        }
        if (target?.includes('username')) {
            return NextResponse.json({ error: "Username already in use by another account." }, { status: 409 });
        }
        return NextResponse.json({ error: "A unique field conflict occurred." }, { status: 409 });
    }
    return NextResponse.json(
      { error: "An internal server error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Registrar") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const students = await prisma.user.findMany({
      where: {
        role: "Student",
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        gender: true,
        phone: true,
        photo: true,
        barcode_id: true,
        batch: true,
        department: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Registrar") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const rawData: Record<string, any> = {};
    formData.forEach((value, key) => {
      // Handle empty strings for optional fields by converting them to null
      if (typeof value === 'string' && value === '') {
          rawData[key] = null;
      } else {
          rawData[key] = value;
      }
    });

    const validationResult = createStudentSchema.safeParse(rawData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, username, email, password, gender, phone, batch, department } = validationResult.data;

    // Check for existing user
    const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    const existingUserByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUserByUsername) {
      return NextResponse.json({ error: "Username already in use" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const photoFile = formData.get("photo") as File | null;
    let photoPath: string | null = null;

    if (photoFile && photoFile.size > 0) {
      try {
        photoPath = await handleFileUpload(photoFile);
      } catch (e: any) {
        return NextResponse.json({ error: e.message || "Photo upload failed" }, { status: 400 });
      }
    }
    
    const newStudent = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`.trim(),
        username,
        email,
        password: hashedPassword,
        gender: gender || null,
        phone: phone || null,
        photo: photoPath,
        batch: batch || null,
        department: department || null,
        role: "Student", // Explicitly set role
      },
      select: { // Select fields to return, excluding password
        id: true, name: true, username: true, email: true, gender: true,
        phone: true, photo: true, barcode_id: true, batch: true,
        department: true, role: true, createdAt: true,
      },
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error: any) {
    console.error("Error creating student:", error);
     if (error.code === 'P2002') { // Prisma unique constraint violation
        return NextResponse.json({ error: "Username or email already exists." }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}