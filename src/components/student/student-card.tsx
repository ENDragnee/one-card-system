// File: components/student/student-card.tsx
"use client";
import { Student } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox

interface StudentCardProps {
  student: Student;
  onView: (studentId: string) => void;
  onEdit: (studentId: string) => void;
  onDelete?: (studentId: string) => void;
  isSelected: boolean; // Changed from function to boolean
  onSelectToggle: (studentId: string, isChecked: boolean) => void; // studentId is string
}

export function StudentCard({
  student,
  onView,
  onEdit,
  onDelete,
  isSelected,
  onSelectToggle,
}: StudentCardProps) {
  const getInitials = (name: string | null | undefined) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  }
  const studentIdStr = String(student.id);
  const studentFullName = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || "Unknown Student";


  // Batch is string "1", "2", etc.
  let yearSuffix = 'th';
  if (student.batch) {
    const batchNum = parseInt(student.batch, 10);
    if (!isNaN(batchNum)) {
        if (batchNum % 10 === 1 && batchNum % 100 !== 11) yearSuffix = 'st';
        else if (batchNum % 10 === 2 && batchNum % 100 !== 12) yearSuffix = 'nd';
        else if (batchNum % 10 === 3 && batchNum % 100 !== 13) yearSuffix = 'rd';
    }
  }
  const studentYearDisplay = student.batch ? `${student.batch}${yearSuffix} Year` : "Freshman";

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-start space-x-3 p-4"> {/* Reduced space-x for checkbox */}
        <div className="pt-1"> {/* Align checkbox with text, adjust as needed */}
          <Checkbox
            id={`select-student-${studentIdStr}`}
            checked={isSelected}
            onCheckedChange={(checked) => onSelectToggle(studentIdStr, !!checked)}
            aria-label={`Select student ${studentFullName}`}
          />
        </div>
        <Avatar className="h-16 w-16 border">
          <AvatarImage src={student.photo || undefined} alt={studentFullName} className="object-cover" />
          <AvatarFallback className="student-card-avatar-placeholder">
            {getInitials(studentFullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <CardTitle className="text-lg">{studentFullName}</CardTitle>
          <CardDescription>ID: {student.username}</CardDescription>
          <CardDescription>
            {student.department || "N/A"} - {studentYearDisplay}
          </CardDescription>
        </div>
      </CardHeader>
      {/* <CardContent className="p-4 pt-0 flex-grow">
         You can add more details here if needed
      </CardContent> */}
      <CardFooter className="p-4 pt-2 mt-auto border-t"> {/* mt-auto to push footer down if CardContent is removed/small */}
        <div className="flex flex-col space-y-2 w-full">
          <Button variant="outline" size="sm" onClick={() => onView(studentIdStr)} className="w-full justify-start">
            <Icons.View className="h-4 w-4 mr-2" /> View
          </Button>
          <Button variant="default" size="sm" onClick={() => onEdit(studentIdStr)} className="w-full justify-start">
            <Icons.Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(studentIdStr)} className="w-full justify-start">
              <Icons.Delete className="h-4 w-4 mr-2" /> Delete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}