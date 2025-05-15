// components/student/student-form-modal.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Student, departments, GENDERS, YEARS, Department, Gender, Year } from "@/types"; // Ensure Student type matches
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Plus, ImageUp, Eye, EyeOff } from "lucide-react"; // Added Eye icons

// Define Zod schema
const baseStudentFormSchema = z.object({
  username: z.string().min(1, "Student ID (Username) is required."),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Invalid email address."),
  password: z.string().optional().or(z.literal('')), // Optional, empty string means no change on edit
  phone: z.string().optional().or(z.literal("")),
  year: z.coerce.number().min(1).max(YEARS[YEARS.length -1] || 5) as z.ZodType<Year>,
  department: z.enum(departments),
  gender: z.enum(GENDERS),
  photoFile: z.instanceof(File).optional().nullable(),
  pictureUrl: z.string().optional(),
  removePhoto: z.boolean().optional(),
});

export type StudentFormData = z.infer<typeof baseStudentFormSchema>;

interface StudentFormModalProps {
  student?: Student & { name?: string | null };
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: StudentFormData, originalUsername?: string) => void; // Changed originalId to originalUsername
  existingUsernames: string[];
}

export function StudentFormModal({
  student,
  isOpen,
  onOpenChange,
  onSubmit,
  existingUsernames,
}: StudentFormModalProps) {
  const isEditing = !!student;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  const studentFormSchema = baseStudentFormSchema.superRefine((data, ctx) => {
    // Username uniqueness check (only on add)
    if (!isEditing && existingUsernames.includes(data.username)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Student ID (Username) already exists.",
        path: ["username"],
      });
    }

    // Password validation
    if (!isEditing) { // Adding new student
      if (!data.password || data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must be at least 6 characters long.",
          path: ["password"],
        });
      }
    } else { // Editing existing student
      if (data.password && data.password.length > 0 && data.password.length < 6) {
        // If password is provided (not empty) and too short
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "New password must be at least 6 characters long.",
          path: ["password"],
        });
      }
    }
  });


  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (isOpen) {
      let fName = "";
      let lName = "";

      if (isEditing && student) {
        if (student.firstName && student.lastName) {
          fName = student.firstName;
          lName = student.lastName;
        } else if (student.name) {
          const nameParts = student.name.trim().split(" ");
          fName = nameParts[0] || "";
          lName = nameParts.slice(1).join(" ") || "";
        }
      }

      const defaultValues: StudentFormData = isEditing && student
        ? {
            username: student.username,
            firstName: fName,
            lastName: lName,
            email: student.email || "",
            password: "", // Always empty on load for edit, user types new one if they want to change
            phone: student.phone || "",
            year: (student.year || YEARS[0]) as Year,
            department: (student.department || departments[0]) as Department,
            gender: (student.gender || GENDERS[0]) as Gender,
            photoFile: null,
            removePhoto: false,
          }
        : { // Adding new student
            username: "",
            firstName: "",
            lastName: "",
            email: "",
            password: "", // Empty for new student, will be validated by Zod
            phone: "",
            year: YEARS[0] as Year,
            department: departments[0] as Department,
            gender: GENDERS[0] as Gender,
            photoFile: null,
            removePhoto: false,
          };
      form.reset(defaultValues);
      setPreviewUrl(isEditing && student?.photo ? student.photo : null);
      setShowPassword(false); // Reset password visibility on open
    } else {
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen, student, isEditing, form]); // form added to dependency array for zodResolver update

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("photoFile", file);
      form.setValue("removePhoto", false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue("photoFile", null);
      if (!student?.photo) {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemovePhotoToggle = (checked: boolean) => {
    form.setValue("removePhoto", checked);
    if (checked) {
      form.setValue("photoFile", null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPreviewUrl(null);
    } else {
      if (student?.photo) {
        setPreviewUrl(student.photo);
      }
    }
  };

  const handleFormSubmit = (data: StudentFormData) => {
    // Pass student's username if editing, otherwise undefined
    onSubmit(data, isEditing ? student?.id : undefined);
    onOpenChange(false);
  };

  const currentPhotoFile = form.watch("photoFile");
  const currentRemovePhoto = form.watch("removePhoto");
  const existingPhotoUrl = student?.photo;

  const getAvatarFallbackText = () => {
    const firstName = form.watch("firstName");
    const lastName = form.watch("lastName");
    if (firstName && lastName) return `${firstName[0]?.toUpperCase()}${lastName[0]?.toUpperCase()}`;
    if (firstName) return firstName[0]?.toUpperCase();
    if (lastName) return lastName[0]?.toUpperCase();
    return "S";
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Student" : "Add New Student"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the student's details." : "Fill in the form to add a new student."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            {/* Photo Upload Section */}
            <FormItem className="flex flex-col items-center space-y-3">
              <FormLabel>Profile Picture</FormLabel>
              <Avatar className="w-24 h-24 border">
                <AvatarImage src={currentRemovePhoto ? undefined : previewUrl || undefined} alt="Profile Preview" />
                <AvatarFallback>{getAvatarFallbackText()}</AvatarFallback>
              </Avatar>
              <Input
                type="file"
                id="photoFile-upload"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handlePhotoChange}
                disabled={currentRemovePhoto}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={currentRemovePhoto}
              >
                <ImageUp className="mr-2 h-4 w-4" /> Choose Image
              </Button>
              {form.formState.errors.photoFile && (
                <FormMessage>{form.formState.errors.photoFile.message as string}</FormMessage>
              )}
              {(existingPhotoUrl || currentPhotoFile) && (
                <FormField
                  control={form.control}
                  name="removePhoto"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-2 w-full max-w-xs">
                      <div className="space-y-0.5">
                        <FormLabel>Remove current picture</FormLabel>
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleRemovePhotoToggle(checked);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </FormItem>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID (Username)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. ETS0001/12" {...field} disabled={isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="md:col-span-2"> {/* Make it span 2 columns for better layout */}
                    <FormLabel>{isEditing ? "New Password (leave blank to keep current)" : "Password"}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={isEditing ? "Enter new password" : "Enter a secure password"}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
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
                      <Input type="tel" placeholder="e.g. 0912345678" {...field} value={field.value ?? ""} />
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
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={String(field.value)}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
            </div>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {isEditing ? "Save Changes" : "Add Student"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}