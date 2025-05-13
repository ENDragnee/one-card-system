// components/student/student-card.tsx
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

interface StudentCardProps {
  student: Student;
  onView: (studentId: string) => void;
  onEdit: (studentId: string) => void;
}

export function StudentCard({ student, onView, onEdit }: StudentCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 flex items-start space-x-4">
        <Avatar className="h-16 w-16 border">
          <AvatarImage src={student.pictureUrl} alt={`${student.firstName} ${student.lastName}`} />
          <AvatarFallback className="student-card-avatar-placeholder">
            {getInitials(`${student.firstName} ${student.lastName}`)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold">{`${student.firstName} ${student.lastName}`}</h3>
          <p className="text-sm text-muted-foreground">ID: {student.id}</p>
          <p className="text-sm text-muted-foreground">{student.department} - Year {student.year}</p>
        </div>
        <div className="flex flex-col space-y-2">
          <Button variant="outline" size="sm" onClick={() => onView(student.id)} className="w-full justify-start">
            <Icons.View className="h-4 w-4 mr-2" /> View
          </Button>
          <Button variant="default" size="sm" onClick={() => onEdit(student.id)} className="w-full justify-start">
            <Icons.Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}