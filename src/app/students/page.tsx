// app/students/page.tsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
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
import { StudentProfileModal } from "@/components/student/student-profile-modal";
import { StudentFormModal, StudentFormData } from "@/components/student/student-form-modal";
import { Student, departments, YEARS, initialStudents } from "@/types"; // Assuming initialStudents is in types for now

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents); // Manage student data
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const existingStudentIds = useMemo(() => students.map(s => s.id), [students]);

  // Apply filters and search
  useEffect(() => {
    let currentStudents = [...students];

    if (filterYear !== "all") {
      currentStudents = currentStudents.filter(s => s.year === parseInt(filterYear));
    }
    if (filterDepartment !== "all") {
      currentStudents = currentStudents.filter(s => s.department === filterDepartment);
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      currentStudents = currentStudents.filter(s =>
        s.firstName.toLowerCase().includes(lowerSearchTerm) ||
        s.lastName.toLowerCase().includes(lowerSearchTerm) ||
        s.id.toLowerCase().includes(lowerSearchTerm) ||
        s.email.toLowerCase().includes(lowerSearchTerm)
      );
    }
    setFilteredStudents(currentStudents);
  }, [students, searchTerm, filterYear, filterDepartment]);

  const handleSearch = () => {
    // Triggered by button or enter, useEffect handles the actual filtering
    // This function is mostly for explicit search button click if needed for other actions
    // For now, useEffect handles it dynamically
  };

  const handleViewStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setIsProfileModalOpen(true);
    }
  };

  const handleOpenAddForm = () => {
    setEditingStudent(null); // Ensure it's an add operation
    setIsFormModalOpen(true);
  };

  const handleEditStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setEditingStudent(student);
      setIsFormModalOpen(true);
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm(`Are you sure you want to delete student ID ${studentId}? This action cannot be undone.`)) {
      setStudents(prevStudents => prevStudents.filter(s => s.id !== studentId));
      setIsProfileModalOpen(false); // Close profile modal if open for this student
      setSelectedStudent(null);
       alert(`Student ID ${studentId} deleted.`);
    }
  };

  const handleStudentFormSubmit = (data: StudentFormData, originalId?: string) => {
    if (originalId) { // Editing
      setStudents(prev => prev.map(s => s.id === originalId ? { ...s, ...data, id: originalId } : s)); // Ensure ID doesn't change via form if editing
    } else { // Adding
      const newStudent: Student = {
        ...data,
        phone: data.phone || undefined,
        pictureUrl: data.pictureUrl || undefined,
      };
      setStudents(prev => [...prev, newStudent]);
    }
    setIsFormModalOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Student Management"
        showSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleSearch}
        placeholder="Search by name, ID, email..."
      />

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {YEARS.map(y => (
                 <SelectItem key={y} value={String(y)}>{y}{['st', 'nd', 'rd'][y-1] || 'th'} Year</SelectItem>
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
          
          {/* Apply Filters button is not strictly needed as filters apply on change via useEffect */}
          {/* <Button onClick={handleApplyFilters} variant="outline">Apply Filters</Button> */}
          
          <Button onClick={handleOpenAddForm} className="w-full sm:w-auto sm:ml-auto">
            <Icons.Add className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </Card>

      {filteredStudents.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStudents.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              onView={handleViewStudent}
              onEdit={handleEditStudent}
            />
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center text-muted-foreground">
          No students found matching your criteria. Try adjusting filters or add a new student.
        </Card>
      )}

      <StudentProfileModal
        student={selectedStudent}
        isOpen={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        onEdit={handleEditStudent}
        onDelete={handleDeleteStudent}
      />

      <StudentFormModal
        student={editingStudent}
        isOpen={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        onSubmit={handleStudentFormSubmit}
        existingStudentIds={existingStudentIds}
      />
    </>
  );
}