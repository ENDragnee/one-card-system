// components/student/student-profile-modal.tsx
"use client";
import { Student, StudentIdData } from "@/types";
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

// Helper to map Student to StudentIdData
export const mapStudentToIdData = (s: Student): StudentIdData => {
  const currentAcademicYear = new Date().getFullYear();
  const academicYearString = s.batch ? `${s.batch}${['st', 'nd', 'rd'][Number(s.batch)-1] || 'th'} Year / ${currentAcademicYear}-${currentAcademicYear + 1}` : `Not Set / ${currentAcademicYear}-${currentAcademicYear + 1}`;

  return {
    id: String(s.id),
    name: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || "Unknown Student",
    username: s.username, // This is the ID Number displayed on card
    department: s.department || null,
    photo: s.photo || null,
    academicYear: academicYearString,
    barcodeValue: s.barcode_id || s.username, // Prefer barcode_id if available
  };
};

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
    if (!student) return;
    const studentForIdCard: StudentIdData = mapStudentToIdData(student);
    const studentsToPrint = [studentForIdCard];
    try {
      const queryParams = encodeURIComponent(JSON.stringify(studentsToPrint));
      // Check URL length
      if ((`/students/print-ids?students=${queryParams}`).length > 2000) {
          alert("Data too long for URL. Cannot print."); // Basic alert
          return;
      }
      window.open(`/students/print-ids?students=${student.id}`, '_blank');
    } catch (e) {
        alert("Error preparing ID for printing.");
        console.error("Error stringifying/encoding for print:", e);
    }
  };

  const studentFullName = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim();
  
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>{studentFullName}'s Profile</DialogTitle>
          <DialogDescription>Detailed information about the student.</DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-[150px_1fr] gap-6 py-4">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-36 w-36 border-2">
              <AvatarImage src={student.photo || undefined} alt={studentFullName} className="object-cover" />
              <AvatarFallback className="text-4xl">
                {getInitials(studentFullName)}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={handlePrintId}>
              <Icons.Print className="h-4 w-4 mr-2" /> Print ID
            </Button>
          </div>
          <div className="space-y-3">
            <ProfileDetail label="Full Name" value={studentFullName} />
            <ProfileDetail label="Student ID" value={student.username} />
            <ProfileDetail label="Email" value={student.email} />
            <ProfileDetail label="Phone" value={student.phone || "N/A"} />
            <ProfileDetail label="Department" value={student.department || "Freshman"} />
            <ProfileDetail label="Year" value={studentYearDisplay} />
            <ProfileDetail label="Gender" value={student.gender || "N/A"} />
          </div>
        </div>
        <Separator />
        <DialogFooter className="mt-4">
          <Button variant="destructive" onClick={() => { onDelete(String(student.id)); onOpenChange(false); }}>
            <Icons.Delete className="h-4 w-4 mr-2" /> Delete
          </Button>
          <Button variant="default" onClick={() => { onEdit(String(student.id)); onOpenChange(false); }}>
            <Icons.Edit className="h-4 w-4 mr-2" /> Edit
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