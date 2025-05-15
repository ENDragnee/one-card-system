// app/api/dashboard/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Adjust path if necessary
import { departments as departmentList, YEARS } from "@/types"; // Ensure YEARS is defined and exported from your types

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) { // Or check for specific role: session.user.role !== "Registrar"
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all users with the role "Student"
    const students = await prisma.user.findMany({
      where: {
        role: "Student",
      },
      select: {
        department: true,
        batch: true, // Assuming 'batch' stores the year level as a string
      },
    });

    const totalStudents = students.length;
    const totalDepartments = departmentList.length; // From your types

    let sumOfYears = 0;
    students.forEach(student => {
      if (student.batch) {
        const year = parseInt(student.batch, 10);
        if (!isNaN(year)) {
          sumOfYears += year;
        }
      }
    });
    const averageYearLevel = totalStudents > 0 ? (sumOfYears / totalStudents).toFixed(1) : "0.0";

    const studentsByDeptCounts: Record<string, number> = {};
    departmentList.forEach(dept => studentsByDeptCounts[dept] = 0);
    students.forEach(student => {
      if (student.department && studentsByDeptCounts.hasOwnProperty(student.department)) {
        studentsByDeptCounts[student.department]++;
      }
    });
    const studentsByDept = Object.entries(studentsByDeptCounts).map(([label, value]) => ({ label, value }));


    // Prepare year map based on your YEARS constant from types
    // Example: YEARS = [1, 2, 3, 4, 5] as const;
    const yearMap: Record<number, string> = {};
    const yearLabels: string[] = [];

    if (YEARS && YEARS.length > 0) {
        YEARS.forEach(y => {
            let suffix = 'th';
            if (y === 1) suffix = 'st';
            else if (y === 2) suffix = 'nd';
            else if (y === 3) suffix = 'rd';
            const label = `${y}${suffix} Year`;
            yearMap[y] = label;
            yearLabels.push(label);
        });
    } else { // Fallback if YEARS is not defined as expected
        console.warn("YEARS constant not found or empty in types. Using default year map.");
        for (let y = 1; y <= 5; y++) {
            let suffix = 'th';
            if (y === 1) suffix = 'st';
            else if (y === 2) suffix = 'nd';
            else if (y === 3) suffix = 'rd';
            const label = `${y}${suffix} Year`;
            yearMap[y] = label;
            yearLabels.push(label);
        }
    }


    const studentsByYearCounts: Record<string, number> = {};
    yearLabels.forEach(label => studentsByYearCounts[label] = 0);

    students.forEach(student => {
      if (student.batch) {
        const year = parseInt(student.batch, 10);
        if (!isNaN(year) && yearMap[year]) {
          studentsByYearCounts[yearMap[year]]++;
        } else if (!isNaN(year)) {
            // Handle years not explicitly in yearMap (e.g., 5th+ Year if map only goes to 4)
            const otherYearLabel = `${year}th Year (Other)`;
            if (!studentsByYearCounts[otherYearLabel]) {
                studentsByYearCounts[otherYearLabel] = 0;
            }
            studentsByYearCounts[otherYearLabel]++;
        }
      }
    });
    const studentsByYear = Object.entries(studentsByYearCounts).map(([label, value]) => ({ label, value }));

    return NextResponse.json({
      totalStudents,
      totalDepartments,
      averageYearLevel,
      studentsByDept,
      studentsByYear,
    });

  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard analytics" },
      { status: 500 }
    );
  }
}