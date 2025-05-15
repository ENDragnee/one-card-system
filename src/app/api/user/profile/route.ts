// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
// import { generateBarcode } from "@/lib/barcodeGenerator"; // Not used in PATCH for own profile
import { hashPassword } from "@/lib/password-utils"; // Not used in PATCH for own profile
import { handleFileUpload, deleteFile } from "@/lib/fileUpload";
import { departments, GENDERS, yearMap } from "@/types"; // Removed YEAR_LEVELS, Year

// Zod schema for updating the current user's profile (PATCH)
const updateUserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  phone: z.string().optional().or(z.literal("")).transform(val => val === "" ? null : val),
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  gender: z.enum(GENDERS, { // Use GENDERS from types
    errorMap: () => ({ message: "Please select a valid gender." }),
  }),
  department: z.enum(departments).optional().nullable(),
  // Year from form is a string key of yearMap ("1", "2", etc.)
  // It will be stored in the 'batch' field in the database.
  year: z.string()
    .refine(val => Object.keys(yearMap).includes(val), {
        message: "Invalid year selected."
    })
    .optional() // Year is optional for profile update
    .nullable()
    .transform(val => (val === "" || val === null) ? null : val), // Ensure empty string becomes null
});

// Zod schema for creating a new student (POST by admin) - slightly adjusted for clarity
const createStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  phone: z.string().optional().or(z.literal("")).transform(val => val === "" ? null : val),
  gender: z.enum(GENDERS).optional().nullable(),
  department: z.enum(departments).optional().nullable(),
  // Year from form is a string key like "1", "2", which will be stored in 'batch'
  year: z.string()
    .refine(val => Object.keys(yearMap).includes(val), {
        message: "Invalid year selected for new student."
    })
    .optional()
    .nullable()
    .transform(val => (val === "" || val === null) ? null : val),
});


async function getCurrentUser(req: NextRequest): Promise<{ id: number; role: Role } | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id && session?.user?.role) {
    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id;
    if (!isNaN(userId)) {
      // Ensure Role type is correctly cast if it comes as string from session
      const userRole = session.user.role as Role;
      if (Object.values(Role).includes(userRole)) {
          return { id: userId, role: userRole };
      }
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
      gender: formData.get("gender") as typeof GENDERS[number] | null,
      department: formData.get("department") as typeof departments[number] | null,
      year: formData.get("year") as string | null, // This will be "1", "2", etc., or null
    };

    const validationResult = updateUserProfileSchema.safeParse(dataFromForm);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input for profile update", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // 'year' from validationResult.data is the string "1", "2", etc., or null
    const { firstName, lastName, phone, email, gender, department, year } = validationResult.data;

    const dataToUpdate: {
      name: string;
      email: string;
      phone?: string | null;
      gender?: typeof GENDERS[number] | null;
      photo?: string | null;
      department?: typeof departments[number] | null;
      batch?: string | null; // Changed from 'year' to 'batch'
      completed: boolean;
      completedAt?: Date; // Changed to Date, consistent with Prisma model
    } = {
      name: `${firstName} ${lastName}`.trim(),
      email,
      gender: gender || null,
      phone,
      department: department || null,
      batch: year, // 'year' is already the string key "1", "2", etc., or null
      completed: true,
      completedAt: new Date(),
    };

    const pictureFile = formData.get("picture") as File | null;
    const removePictureFlag = formData.get("removePicture") === "true";

    const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { photo: true } });
    const oldPhotoPath = userRecord?.photo;

    if (removePictureFlag) {
        dataToUpdate.photo = null;
        if (oldPhotoPath) await deleteFile(oldPhotoPath);
    } else if (pictureFile && pictureFile.size > 0) {
      try {
        if (oldPhotoPath) await deleteFile(oldPhotoPath);
        dataToUpdate.photo = await handleFileUpload(pictureFile);
      } catch (e: any) {
        return NextResponse.json({ error: e.message || "Photo upload failed" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      // Ensure 'batch' is selected to be returned
      select: { id: true, name: true, username: true, email: true, gender: true, phone: true, photo: true, department: true, role: true, createdAt: true, batch: true, barcode_id: true, completed: true, completedAt: true },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser, // updatedUser will have { ..., batch: "1", ... }
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

// GET and POST handlers remain, ensure createStudentSchema's year handling is also consistent
// if you create students through a similar form structure.
// The provided POST handler already expects 'year' as a string and stores it in 'batch'.
// The updated createStudentSchema above makes it consistent with PATCH.
// ... (Rest of the GET and POST handlers from your provided code)
// Ensure `generateBarcode` is imported if used in POST
import { generateBarcode } from "@/lib/barcodeGenerator";

// GET handler to fetch all students (Registrar only)
export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    // Ensure Role.Registrar is correctly compared
    if (!currentUser || currentUser.role !== Role.Registrar) { 
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
    
    // Map 'batch' (string from DB) to 'year' (number for frontend consistency in some places)
    // For ProfileFormPage, we'd prefer 'batch' as string if it directly populates initialData.year
    const processedStudents = students.map(s => ({
        ...s,
        // For general display or other forms, 'year' as number might be useful
        // For this specific ProfileFormPage, if initialData comes from such a source,
        // ensure 'year' is converted back to string (key of yearMap)
        numericYear: s.batch ? parseInt(s.batch, 10) : null 
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
      if (key === "photoFile") continue; 

      // Convert empty strings for optional fields to null for validation
      if (typeof value === 'string' && value === '' && ['phone', 'gender', 'department', 'year'].includes(key)) {
          rawData[key] = null; 
      } else {
          rawData[key] = value; // 'year' will be string "1", "2" etc.
      }
    }
    
    const validationResult = createStudentSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error("Validation Errors (POST create student):", JSON.stringify(validationResult.error.flatten().fieldErrors, null, 2));
      return NextResponse.json(
        { error: "Invalid input for new student", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // 'year' from validationResult.data is the string "1", "2", etc., or null
    const { firstName, lastName, username, email, password, gender, phone, year, department } = validationResult.data;

    const existingUser = await prisma.user.findFirst({
        where: { OR: [{email}, {username}]}
    });
    if (existingUser) {
        if (existingUser.email === email) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        if (existingUser.username === username) return NextResponse.json({ error: "Username already in use" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const photoFileFromForm = formData.get("photoFile") as File | null;
    let photoPath: string | null = null;

    if (photoFileFromForm && photoFileFromForm.size > 0) {
      try {
        photoPath = await handleFileUpload(photoFileFromForm);
      } catch (e: any) {
        return NextResponse.json({ error: e.message || "Photo upload failed for new student" }, { status: 400 });
      }
    }
    const barcodeValue = generateBarcode(); 
    const newStudentData: any = {
      name: `${firstName} ${lastName}`.trim(),
      username,
      email,
      password: hashedPassword,
      gender: gender || null,
      phone: phone || null,
      photo: photoPath,
      department: department || null,
      role: Role.Student,
      barcode_id: barcodeValue,
      completed: false, // New students might not be 'completed' by default
      batch: year, // 'year' is already string "1", "2" or null
    };
    // If 'completed' status depends on 'year' or other fields, adjust logic here
    if (year && department && gender) { // Example: if these are filled, mark as completed
        // newStudentData.completed = true;
        // newStudentData.completedAt = new Date();
    }
    
    const newStudent = await prisma.user.create({
      data: newStudentData,
      select: {
        id: true, name: true, username: true, email: true, gender: true,
        phone: true, photo: true, barcode_id: true, batch: true,
        department: true, role: true, createdAt: true, completed: true,
        completedAt: true,
      },
    });

    return NextResponse.json(newStudent, { status: 201 }); // newStudent has 'batch' field

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