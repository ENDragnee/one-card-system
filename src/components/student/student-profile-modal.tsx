// components/student/student-profile-modal.tsx
"use client";
import { Student } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";

interface StudentProfileModalProps {
  student: Student | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEdit: (studentId: string) => void;
  onDelete: (studentId: string) => void;
}

export function StudentProfileModal({
  student,
  isOpen,
  onOpenChange,
  onEdit,
  onDelete,
}: StudentProfileModalProps) {
  if (!student) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const handlePrintId = () => {
    alert(`Simulating ID print for ${student.firstName} ${student.lastName} (ID: ${student.id}).`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>{`${student.name}`}'s Profile</DialogTitle>
          <DialogDescription>Detailed information about the student.</DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-[150px_1fr] gap-6 py-4">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-36 w-36 border-2">
              <AvatarImage src={student.photo} alt={student.name} />
              <AvatarFallback className="text-4xl student-card-avatar-placeholder">
                {getInitials(`${student.name}`)}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={handlePrintId}>
              <Icons.Print className="h-4 w-4 mr-2" /> Print ID
            </Button>
          </div>
          <div className="space-y-3">
            <ProfileDetail label="Full Name" value={`${student.name}`} />
            <ProfileDetail label="Student ID" value={student.username} />
            <ProfileDetail label="Email" value={student.email} />
            <ProfileDetail label="Phone" value={student.phone || "N/A"} />
            <ProfileDetail label="Department" value={student.department || "Freshman"} />
            <ProfileDetail label="Year" value={`${student.batch}${['st', 'nd', 'rd'][student.year-1] || 'th'} Year`|| "Freshman"} />
            <ProfileDetail label="Gender" value={student.gender} />
          </div>
        </div>
        <Separator />
        <DialogFooter className="mt-4">
          <Button variant="destructive" onClick={() => onDelete(student.id)}>
            <Icons.Delete className="h-4 w-4 mr-2" /> Delete Student
          </Button>
          <Button variant="default" onClick={() => { onOpenChange(false); onEdit(student.id); }}>
            <Icons.Edit className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProfileDetail({ label, value }: { label: string, value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center">
      <p className="text-sm font-medium text-muted-foreground">{label}:</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}