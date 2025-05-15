// File: app/student/page.tsx
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
import { StudentCard } from "@/components/student/student-card";
import { StudentProfileModal } from "@/components/student/student-profile-modal"; // mapStudentToIdData removed
import { StudentFormModal, StudentFormData } from "@/components/student/student-form-modal";
import { Student, departments, YEARS } from "@/types"; // StudentIdData removed if not used elsewhere
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Printer } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

// BATCH_YEARS can remain if used for filtering, otherwise not directly relevant to this change
// const CURRENT_YEAR = new Date().getFullYear();
// const BATCH_YEARS: string[] = Array.from({ length: 7 }, (_, i) => (CURRENT_YEAR - 3 + i).toString());

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterBatch, setFilterBatch] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [selectedStudentIdsForPrint, setSelectedStudentIdsForPrint] = useState<Set<string>>(new Set());

  const existingStudentUsernames = useMemo(() => students.map(s => s.username.toLowerCase()), [students]);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile"); 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch students");
      }
      const data: Student[] = await response.json();
      setStudents(data);
      // setFilteredStudents(data); // Filter effect will handle this
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message || "Could not load students.", variant: "destructive" });
      setStudents([]);
      // setFilteredStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    let currentStudents = [...students];

    if (filterBatch !== "all") {
      currentStudents = currentStudents.filter(s => String(s.batch) === filterBatch || String(s.year) === filterBatch);
    }
    if (filterDepartment !== "all") {
      currentStudents = currentStudents.filter(s => s.department === filterDepartment);
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      currentStudents = currentStudents.filter(s =>
        s.name?.toLowerCase().includes(lowerSearchTerm) ||
        s.username.toLowerCase().includes(lowerSearchTerm) ||
        String(s.id).toLowerCase().includes(lowerSearchTerm) ||
        s.email.toLowerCase().includes(lowerSearchTerm)
      );
    }
    setFilteredStudents(currentStudents);
  }, [students, searchTerm, filterBatch, filterDepartment]);


  const handleViewStudent = (studentId: string) => {
    const student = students.find(s => String(s.id) === studentId);
    if (student) {
      setSelectedStudent(student);
      setIsProfileModalOpen(true);
    }
  };

  const handleOpenAddForm = () => {
    setEditingStudent(null);
    setIsFormModalOpen(true);
  };

  const handleEditStudent = (studentId: string) => {
    const student = students.find(s => String(s.id) === studentId);
    if (student) {
      setEditingStudent(student);
      setIsFormModalOpen(true);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm(`Are you sure you want to delete student ID ${studentId}? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/user/profile/${studentId}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete student");
        }
        toast({ title: "Success", description: `Student ID ${studentId} deleted.` });
        fetchStudents(); 
        setIsProfileModalOpen(false);
        setSelectedStudent(null);
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Could not delete student.", variant: "destructive" });
      }
    }
  };

  const handleStudentFormSubmit = async (data: StudentFormData, originalUsername?: string) => {
    // setIsLoading(true); // Already handled by fetchStudents implicitly
    const formData = new FormData();

    (Object.keys(data) as Array<keyof StudentFormData>).forEach(key => {
      if (key === 'photoFile') return; 
      const value = data[key];
      if (value !== undefined && value !== null) {
          formData.append(key, String(value));
      }
    });

    if (data.photoFile instanceof File) {
      formData.append('photoFile', data.photoFile);
    }
    if (data.removePhoto) {
      formData.append('removePhoto', 'true');
    }

    const isUpdating = !!editingStudent;
    const studentIdForUpdate = editingStudent ? String(editingStudent.id) : null;
    
    const url = isUpdating && studentIdForUpdate
      ? `/api/user/profile/${studentIdForUpdate}`
      : '/api/user/profile';                     
    const method = isUpdating ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, { method, body: formData });
      const result = await response.json();

      if (!response.ok) {
        const errorDetails = result.details ? ` Details: ${JSON.stringify(result.details, null, 2)}` : '';
        throw new Error(result.error || `Failed to ${isUpdating ? 'update' : 'add'} student.${errorDetails}`);
      }

      toast({ title: "Success", description: `Student ${isUpdating ? 'updated' : 'added'} successfully.` });
      setIsFormModalOpen(false);
      setEditingStudent(null); 
      fetchStudents(); 
    } catch (error: any) {
      console.error(`Error ${isUpdating ? 'updating' : 'adding'} student:`, error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleStudentSelectionForPrint = (studentId: string) => {
    setSelectedStudentIdsForPrint(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };
  
  // The onSelectToggle prop for StudentCard expects (studentId: string, isChecked: boolean)
  // Our toggleStudentSelectionForPrint only needs studentId.
  const handleCardSelectToggle = (studentId: string, _isChecked: boolean) => {
    toggleStudentSelectionForPrint(studentId);
  };


  const handleSelectAllFilteredForPrint = (isChecked: boolean) => {
    if (isChecked) {
      const ids = new Set(filteredStudents.map(s => String(s.id)));
      setSelectedStudentIdsForPrint(ids);
    } else {
      setSelectedStudentIdsForPrint(new Set());
    }
  };

  const handleBatchPrint = () => {
    if (selectedStudentIdsForPrint.size === 0) {
      toast({ title: "No students selected", description: "Please select students to print IDs.", variant: "default" });
      return;
    }
    const idsArray = Array.from(selectedStudentIdsForPrint);
    const idsQueryParam = idsArray.join(',');
    // No need for long URL checks or JSON stringification of full objects
    const url = `/students/print-ids?ids=${idsQueryParam}`;
    window.open(url, '_blank');
  };
  
  const areAllFilteredSelected = filteredStudents.length > 0 && selectedStudentIdsForPrint.size === filteredStudents.length &&
                                 filteredStudents.every(s => selectedStudentIdsForPrint.has(String(s.id)));


  if (isLoading && students.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <LoaderCircle className="animate-spin h-12 w-12 text-blue-600 mb-4" />
        <p className="text-lg text-gray-700">Loading students...</p>
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
        placeholder="Search by name, username, ID, email..."
      />

      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap items-center gap-4">
          <Select value={filterBatch} onValueChange={setFilterBatch}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="Filter by Batch/Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches/Years</SelectItem>
              {YEARS.map(y => (
                 <SelectItem key={y} value={String(y)}>{y}{['st', 'nd', 'rd'][(y-1)%10] || 'th'} Year</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="w-full lg:w-[220px]">
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2 lg:ml-auto w-full lg:w-auto mt-4 lg:mt-0 col-span-full md:col-span-1">
            <Button
              onClick={handleBatchPrint}
              variant="outline"
              className="flex-1 lg:flex-none"
              disabled={selectedStudentIdsForPrint.size === 0 || isLoading}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print ({selectedStudentIdsForPrint.size})
            </Button>
            <Button onClick={handleOpenAddForm} className="flex-1 lg:flex-none">
              <Icons.Add className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>
        
        {filteredStudents.length > 0 && !isLoading && (
          <div className="mt-4 flex items-center space-x-2 border-t pt-4">
            <Checkbox
              id="select-all-filtered"
              checked={areAllFilteredSelected}
              onCheckedChange={(checked) => handleSelectAllFilteredForPrint(checked as boolean)}
              disabled={isLoading}
            />
            <label htmlFor="select-all-filtered" className="text-sm font-medium cursor-pointer">
              Select all {filteredStudents.length} displayed students
            </label>
          </div>
        )}
      </Card>

      {isLoading && students.length > 0 && (
        <div className="flex justify-center items-center py-10">
          <LoaderCircle className="animate-spin h-8 w-8 text-blue-500" />
          <p className="ml-2">Updating student list...</p>
        </div>
      )}

      {!isLoading && filteredStudents.length === 0 && (
        <Card className="p-6 text-center text-muted-foreground">
          No students found matching your criteria. Try adjusting filters or add a new student.
        </Card>
      )}

      {!isLoading && filteredStudents.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStudents.map(student => (
            <StudentCard
              key={String(student.id)} 
              student={student} 
              onView={() => handleViewStudent(String(student.id))}
              onEdit={() => handleEditStudent(String(student.id))}
              onDelete={() => handleDeleteStudent(String(student.id))}
              isSelected={selectedStudentIdsForPrint.has(String(student.id))}
              onSelectToggle={handleCardSelectToggle} // Use the wrapper function
            />
          ))}
        </div>
      )}

      <StudentProfileModal
        student={selectedStudent}
        isOpen={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        onEdit={(id) => { setIsProfileModalOpen(false); handleEditStudent(id);}}
        onDelete={(id) => { setIsProfileModalOpen(false); handleDeleteStudent(id);}}
      />

      <StudentFormModal
        student={editingStudent || undefined}
        isOpen={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        onSubmit={handleStudentFormSubmit}
        existingUsernames={existingStudentUsernames}
      />
    </>
  );
}