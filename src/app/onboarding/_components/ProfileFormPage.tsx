// app/onboarding/_components/ProfileFormPage.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OnboardingCard } from "@/components/OnboardingCard";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { signOut } from "next-auth/react";
import { departments, yearMap, GENDERS as FormGenders } from "@/types"; // Using FormGenders to avoid conflict
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const profileFormSchema = z.object({
  picture: z.any().optional(),
  removePicture: z.boolean().optional(),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  gender: z.enum(["male", "female", "other"], { // Explicitly allow "other"
    errorMap: () => ({ message: "Please select a gender." }),
  }),
  department: z.enum(departments, {
    errorMap: () => ({ message: "Please select a department." }),
  }),
  // Year will be the string key of yearMap, e.g., "1", "2"
  year: z.string().refine(val => Object.keys(yearMap).includes(val), {
    message: "Please select a valid year.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormPageProps {
  onProfileSaveSuccess: () => void;
  // Assuming initialData.year, if provided, is the string key like "1", "2"
  initialData?: Partial<ProfileFormValues & { name?: string | null, photo?: string | null }>;
}

export function ProfileFormPage({ onProfileSaveSuccess, initialData }: ProfileFormPageProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.photo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();

  // Ensure year defaults to a string key from yearMap
  const firstYearKey = Object.keys(yearMap)[0] || "1";

  const defaultValues: ProfileFormValues = {
    firstName: initialData?.name?.split(' ')[0] || "",
    lastName: initialData?.name?.split(' ').slice(1).join(' ') || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    gender: initialData?.gender || (FormGenders[0]),
    picture: undefined,
    removePicture: false,
    department: initialData?.department || departments[0],
    year: initialData?.year || firstYearKey, // e.g., "1"
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

 useEffect(() => {
    const effectiveInitialData = {
        firstName: initialData?.name?.split(' ')[0] || "",
        lastName: initialData?.name?.split(' ').slice(1).join(' ') || "",
        phone: initialData?.phone || "",
        email: initialData?.email || "",
        gender: (initialData?.gender as "male" | "female" | "other") || "male",
        picture: undefined,
        removePicture: false,
        department: initialData?.department || departments[0],
        year: initialData?.year || firstYearKey,
    };
    form.reset(effectiveInitialData);
    setPreviewUrl(initialData?.photo || null);
  }, [initialData, form, firstYearKey]); // Added form and firstYearKey to dependency array


  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("picture", file);
      form.setValue("removePicture", false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      if (!initialData?.photo) setPreviewUrl(null);
    }
  };

  const handleRemovePictureToggle = (checked: boolean) => {
    form.setValue("removePicture", checked);
    if (checked) {
      form.setValue("picture", undefined);
      if(fileInputRef.current) fileInputRef.current.value = "";
      setPreviewUrl(null);
    } else {
      // If unchecking remove, and there was an initial photo, restore preview
      if (initialData?.photo) {
        setPreviewUrl(initialData.photo);
      }
      // If a file was selected before hitting remove, that selection is lost from input.
      // User would need to re-select if they uncheck "remove" and want the new file.
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();

    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    formData.append("gender", data.gender);
    formData.append("department", data.department);
    formData.append("year", data.year); // This is now "1", "2", etc.
    if (data.phone) {
      formData.append("phone", data.phone);
    } else {
      formData.append("phone", "");
    }

    if (data.removePicture) {
        formData.append("removePicture", "true");
    } else if (data.picture instanceof File) {
        formData.append("picture", data.picture);
    }


    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.error || "Failed to update profile.";
        const errorDetails = result.details ?
            Object.entries(result.details as Record<string, string[]>)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('; ')
            : "";
        toast({
          title: "Error",
          description: `${errorMsg} ${errorDetails ? `(${errorDetails})` : ""}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Your profile has been updated.",
        });

        const updatedUser = result.user; // API returns user with { ..., batch: "1", ... }
        form.reset({
            firstName: updatedUser.name?.split(' ')[0] || "",
            lastName: updatedUser.name?.split(' ').slice(1).join(' ') || "",
            email: updatedUser.email,
            phone: updatedUser.phone || "",
            gender: (updatedUser.gender as "male" | "female" | "other") || "male",
            department: updatedUser.department || departments[0],
            year: updatedUser.batch || firstYearKey, // Use batch from API response, which is "1", "2", etc.
            picture: undefined,
            removePicture: false,
        });
        setPreviewUrl(updatedUser.photo || null);

        onProfileSaveSuccess();
      }
    } catch (error) {
      console.error("Network or parsing error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const getAvatarFallback = () => {
    const firstName = form.watch("firstName");
    const lastName = form.watch("lastName");
    let fallback = "P";
    if (firstName && lastName) {
      fallback = `${firstName[0]?.toUpperCase()}${lastName[0]?.toUpperCase()}`;
    } else if (firstName) {
      fallback = firstName[0]?.toUpperCase();
    } else if (lastName) {
      fallback = lastName[0]?.toUpperCase();
    }
    return fallback;
  };

  const currentRemovePictureValue = form.watch("removePicture");

  return (
    <OnboardingCard
      title={`Welcome to Samara University, ${session?.user.name || session?.user.username}!`}
      description="This is your student onboarding area. Complete the steps below to get started."
    >
      <div className="flex flex-col justify-center mb-4">
        <Button variant="outline" className="mb-4 max-w-md mx-auto bg-black text-white hover:bg-red-500 hover:text-white" onClick={() => signOut({ callbackUrl: '/' })}>Sign out</Button>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* ... (picture upload and other fields remain the same) ... */}
            <div className="flex flex-col items-center space-y-3">
              <FormLabel>Profile Picture</FormLabel>
              <Avatar className="w-24 h-24 border">
                <AvatarImage src={previewUrl || undefined} alt="Profile Preview" className="cover" />
                <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
              </Avatar>
              <Input
                type="file"
                id="picture-upload"
                // {...form.register("picture")} // react-hook-form handles this if needed, but manual setValue is fine
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handlePictureChange}
                disabled={isSubmitting || currentRemovePictureValue}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || currentRemovePictureValue}
              >
                Choose Image
              </Button>
              {form.formState.errors.picture && (
                  <FormMessage>{form.formState.errors.picture.message as string}</FormMessage>
              )}
              {(previewUrl || initialData?.photo) && (
                <FormField
                  control={form.control}
                  name="removePicture"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-2 w-full max-w-xs">
                      <div className="space-y-0.5">
                        <FormLabel>Remove current picture</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                              field.onChange(checked);
                              handleRemovePictureToggle(checked);
                          }}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane" {...field} disabled={isSubmitting} />
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
                      <Input placeholder="e.g., Doe" {...field} disabled={isSubmitting} />
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
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g., +15551234567" {...field} value={field.value || ""} disabled={isSubmitting} />
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
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} disabled={isSubmitting} />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={"Select your department"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Year (Batch) Dropdown - value will be "1", "2", etc. */}
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value} // field.value is already "1", "2", etc.
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                           {/* Display the corresponding label */}
                          <SelectValue placeholder={"Select your Year"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(yearMap).map(([key, label]) => (
                          <SelectItem key={key} value={key}> {/* value is "1", "2", etc. */}
                            {label} {/* display is "1st Year", "2nd Year", etc. */}
                          </SelectItem>
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
                  <FormItem className="space-y-3">
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col justify-around space-y-1 md:flex-row md:space-y-0 md:space-x-4"
                      >
                        {(FormGenders as readonly ("male" | "female" | "other")[]).map((genderValue) => (
                           <FormItem key={genderValue} className="flex items-center space-x-3 space-y-0">
                           <FormControl>
                             <RadioGroupItem value={genderValue} disabled={isSubmitting}/>
                           </FormControl>
                           <FormLabel className="font-normal capitalize">{genderValue}</FormLabel>
                         </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </OnboardingCard>
  );
}