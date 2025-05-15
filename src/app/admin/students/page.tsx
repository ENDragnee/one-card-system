// app/students/page.tsx
"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { StudentCard } from "@/components/student/student-card"; // Needs update for new Student type
import { StudentProfileModal } from "@/components/student/student-profile-modal"; // Needs update
import { StudentFormModal, StudentFormData } from "@/components/student/student-form-modal"; // Needs significant update
import { Student, departments, YEARS, Department, Gender } from "@/types"; // Ensure Student type matches API response
import { useToast } from "@/hooks/use-toast"; // Or your custom hook path
import { LoaderCircle } from 'lucide-react';

// This initialStudents should be removed or used only for dev if API fails
// const initialStudents: Student[] = []; 

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterBatch, setFilterBatch] = useState<string>("all"); // Changed from filterYear
  const [filterDepartment, setFilterDepartment] = useState<string>("all");

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Memoize for StudentFormModal to prevent re-renders if students don't change
  const existingStudentUsernames = useMemo(() => students.map(s => s.username.toLowerCase()), [students]);
  const existingStudentEmails = useMemo(() => students.map(s => s.email.toLowerCase()), [students]);


  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data: Student[] = await response.json();
      setStudents(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not load students.", variant: "destructive" });
      setStudents([]); // Fallback to empty on error
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Apply filters and search
  useEffect(() => {
    let currentStudents = [...students];

    if (filterBatch !== "all") {
      currentStudents = currentStudents.filter(s => s.year === Number(filterBatch));
    }
    if (filterDepartment !== "all") {
      currentStudents = currentStudents.filter(s => s.department === filterDepartment);
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      currentStudents = currentStudents.filter(s =>
        s.firstName?.toLowerCase().includes(lowerSearchTerm) ||
        s.lastName?.toLowerCase().includes(lowerSearchTerm) ||
        s.username.toLowerCase().includes(lowerSearchTerm) ||
        String(s.id).toLowerCase().includes(lowerSearchTerm) || // ID is number
        s.email.toLowerCase().includes(lowerSearchTerm)
      );
    }
    console.log("Filtered students based on search term:", currentStudents);
    setFilteredStudents(currentStudents);
  }, [students, searchTerm, filterBatch, filterDepartment]);

  const handleViewStudent = (studentId: number) => {
    const student = students.find(s => Number(s.id) === studentId);
    if (student) {
      setSelectedStudent(student);
      setIsProfileModalOpen(true);
    }
  };

  const handleOpenAddForm = () => {
    setEditingStudent(null);
    setIsFormModalOpen(true);
  };

  const handleEditStudent = (studentId: number) => {
    const student = students.find(s => Number(s.id) === studentId);
    if (student) {
      setEditingStudent(student);
      setIsFormModalOpen(true);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (window.confirm(`Are you sure you want to delete student ID ${studentId}? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/user/profile/${studentId}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete student");
        }
        toast({ title: "Success", description: `Student ID ${studentId} deleted.` });
        setStudents(prev => prev.filter(s => Number(s.id) !== studentId));
        setIsProfileModalOpen(false);
        setSelectedStudent(null);
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Could not delete student.", variant: "destructive" });
      }
    }
  };

  const handleStudentFormSubmit = async (data: StudentFormData, originalId?: string) => {
    const formData = new FormData();
    // Append all non-file fields from data
    (Object.keys(data) as Array<keyof StudentFormData>).forEach(key => {
        if (key === 'photoFile' as keyof StudentFormData) return; // Skip file, handle separately
        const value = data[key];
        if (value !== undefined && value !== null && value !== '') {
            formData.append(key, String(value));
        } else if (value === null && ['phone', 'batch', 'gender', 'department'].includes(key)) {
            // Explicitly send empty string for server to interpret as null for optional fields
            formData.append(key, ""); 
        }
    });

    if (data.pictureUrl && data.pictureUrl !== '') {
        formData.append('pictureUrl', data.pictureUrl);
    } else if (data.removePhoto) {
        formData.append('removePhoto', 'true');
    }


    const url = originalId ? `/api/user/profile/${originalId}` : '/api/user/profile';
    const method = originalId ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, { method, body: formData });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${originalId ? 'update' : 'add'} student. ${result.details ? JSON.stringify(result.details) : ''}`);
      }

      toast({ title: "Success", description: `Student ${originalId ? 'updated' : 'added'} successfully.` });
      setIsFormModalOpen(false);
      fetchStudents(); // Re-fetch to get the latest list including the new/updated student
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };
  
  // Example Batches (you might want to generate this dynamically or fetch from somewhere)
  const BATCH_YEARS = ["2020", "2021", "2022", "2023", "2024", "2025"];


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderCircle className="animate-spin h-8 w-8 text-blue-500" />
        <p className="ml-2">Loading students...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Student Management"
        showSearch
        searchTerm={searchTerm}
        onSearchChange={(term: string) => setSearchTerm(term)}
        // onSearchSubmit={handleSearch} // Not strictly needed with dynamic filtering
        placeholder="Search by name, ID, username, email..."
      />

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Updated to Filter by Batch */}
          <Select value={filterBatch} onValueChange={setFilterBatch}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {BATCH_YEARS.map(b => ( // Assuming BATCH_YEARS is defined
                 <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleOpenAddForm} className="w-full sm:w-auto sm:ml-auto">
            <Icons.Add className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </Card>

      {filteredStudents.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStudents.map(student => (
            <StudentCard // This component needs to be updated to accept the new Student type
              key={student.id}
              student={student} 
              onView={() => handleViewStudent(Number(student.id))}
              onEdit={() => handleEditStudent(Number(student.id))}
              onDelete={() => handleDeleteStudent(Number(student.id))} // Added onDelete to card
            />
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center text-muted-foreground">
          No students found matching your criteria. Try adjusting filters or add a new student.
        </Card>
      )}

      {/* StudentProfileModal and StudentFormModal need significant updates to match new data structure and API */}
      <StudentProfileModal
        student={selectedStudent}
        isOpen={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        onEdit={() => selectedStudent && handleEditStudent(Number(selectedStudent.id))}
        onDelete={() => selectedStudent && handleDeleteStudent(Number(selectedStudent.id))}
      />

      <StudentFormModal
        student={editingStudent || undefined} // Convert null to undefined to match the expected type
        isOpen={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        onSubmit={handleStudentFormSubmit}
        // Pass existing usernames/emails for client-side validation hints if desired
        existingUsernames={existingStudentUsernames}
      />
    </>
  );
}