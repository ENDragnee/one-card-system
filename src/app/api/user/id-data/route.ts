// File: app/api/user/id-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, User as PrismaUser } from '@prisma/client'; // Assuming User is your Prisma model name
import { StudentIdData } from '@/types'; // Make sure this type is defined correctly

const prisma = new PrismaClient();

// Helper function to map Prisma User to StudentIdData
// This should be consistent with the logic in your StudentProfileModal's mapStudentToIdData
function mapUserToStudentIdData(user: PrismaUser): StudentIdData {
  const currentAcademicYear = new Date().getFullYear();
  let yearSuffix = 'th';
  if (user.batch) {
    const batchNum = parseInt(user.batch, 10);
    if (!isNaN(batchNum)) {
      if (batchNum % 10 === 1 && batchNum % 100 !== 11) yearSuffix = 'st';
      else if (batchNum % 10 === 2 && batchNum % 100 !== 12) yearSuffix = 'nd';
      else if (batchNum % 10 === 3 && batchNum % 100 !== 13) yearSuffix = 'rd';
    }
  }

  const academicYearString = user.batch
    ? `${user.batch}${yearSuffix} Year / ${currentAcademicYear}-${currentAcademicYear + 1}`
    : `N/A / ${currentAcademicYear}-${currentAcademicYear + 1}`;

  return {
    id: String(user.id),
    name: user.name || "Unknown Student",
    username: user.username, // Student ID number for display on card
    department: user.department || null,
    photo: user.photo || null,
    academicYear: academicYearString,
    barcodeValue: user.barcode_id || user.username, // Prefer barcode_id if available
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const idsParam = searchParams.get('ids');

  if (!idsParam) {
    return NextResponse.json({ message: 'Missing student IDs parameter' }, { status: 400 });
  }

  const studentIds = idsParam.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

  if (studentIds.length === 0) {
    return NextResponse.json({ message: 'No valid student IDs provided' }, { status: 400 });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: studentIds,
        },
        role: 'Student', // Ensure we only fetch students if role is a factor
      },
    });

    if (users.length === 0) {
      return NextResponse.json({ message: 'No students found for the provided IDs' }, { status: 404 });
    }

    const studentsIdData: StudentIdData[] = users.map(mapUserToStudentIdData);
    return NextResponse.json(studentsIdData);

  } catch (error) {
    console.error('Error fetching student data for IDs:', error);
    return NextResponse.json({ message: 'Error fetching student data', error: (error as Error).message }, { status: 500 });
  }
}