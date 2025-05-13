// components/student/student-form-modal.tsx
"use client";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Student, departments, GENDERS, YEARS, Department, Gender, Year } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "../icons";

// Define Zod schema
const studentFormSchema = z.object({
  id: z.string().min(1, "Student ID is required.").max(10, "ID too long."),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  year: z.coerce.number().min(1).max(5),
  department: z.enum(departments),
  gender: z.enum(GENDERS),
  pictureUrl: z.string().url("Invalid URL.").optional().or(z.literal('')),
});

export type StudentFormData = z.infer<typeof studentFormSchema>;

interface StudentFormModalProps {
  student?: Student | null; // For editing
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: StudentFormData, originalId?: string) => void; // Pass originalId for editing
  existingStudentIds: string[]; // To check for uniqueness on add
}

export function StudentFormModal({
  student,
  isOpen,
  onOpenChange,
  onSubmit,
  existingStudentIds,
}: StudentFormModalProps) {
  const isEditing = !!student;
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema.refine(data => {
      // If adding, check if ID is unique. If editing, allow same ID.
      if (!isEditing && existingStudentIds.includes(data.id)) {
        return false;
      }
      return true;
    }, {
      message: "Student ID already exists.",
      path: ["id"], // Path of the error
    })),
    defaultValues: isEditing && student
      ? {
          ...student,
          year: student.year,
          department: student.department as Department, // Ensure type compatibility
          gender: student.gender as Gender,
          pictureUrl: student.pictureUrl || '',
        }
      : {
          id: "",
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          year: 1,
          department: departments[0],
          gender: GENDERS[0],
          pictureUrl: "",
        },
  });

  // Reset form when student prop changes (e.g., opening for edit after add)
  // Or when opening for add after being closed.
  React.useEffect(() => {
    if (isOpen) {
      form.reset(
        isEditing && student
          ? {
              ...student,
              year: student.year,
              department: student.department as Department,
              gender: student.gender as Gender,
              pictureUrl: student.pictureUrl || '',
            }
          : {
              id: "",
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              year: 1,
              department: departments[0],
              gender: GENDERS[0],
              pictureUrl: "",
            }
      );
    }
  }, [isOpen, student, isEditing, form]);


  const handleFormSubmit = (data: StudentFormData) => {
    onSubmit(data, isEditing ? student?.id : undefined);
    onOpenChange(false); // Close modal on successful submit
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Student" : "Add New Student"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the student's details." : "Fill in the form to add a new student."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. S001" {...field} disabled={isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g. john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g. 0912345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YEARS.map(y => (
                          <SelectItem key={y} value={String(y)}>{y}{['st', 'nd', 'rd'][y-1] || 'th'} Year</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDERS.map(g => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pictureUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Picture URL (Optional)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">
                <Icons.Add className="h-4 w-4 mr-2" />
                {isEditing ? "Save Changes" : "Add Student"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}