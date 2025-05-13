// app/onboarding/_components/ProfileFormPage.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React, { useState, useRef } from "react";

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
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OnboardingCard } from "@/components/OnboardingCard";

const profileFormSchema = z.object({
  picture: z.any().optional(), // Handle file upload validation separately if needed
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  phone: z.string().optional(), // Add regex for phone if needed
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Please select a gender." }),
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormPageProps {
  onProfileSaveSuccess: () => void;
}

export function ProfileFormPage({ onProfileSaveSuccess }: ProfileFormPageProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    },
  });

  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("picture", file); // For react-hook-form to track the file
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue("picture", null);
      setPreviewUrl(null);
    }
  };

  function onSubmit(data: ProfileFormValues) {
    console.log("Profile data:", data);
    // TODO: Implement actual profile save logic (e.g., upload picture, save data)
    alert("Profile saved! (This is a demo, no data is actually saved.)");
    onProfileSaveSuccess();
  }

  return (
    <OnboardingCard
      title="Complete Your Profile"
      description="Help us get to know you better."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <FormLabel>Profile Picture</FormLabel>
            <Avatar className="w-24 h-24 border"> {/* Size like 100px */}
              <AvatarImage src={previewUrl || undefined} alt="Profile Preview" />
              <AvatarFallback>
                {form.getValues("firstName")?.[0]?.toUpperCase() || ""}
                {form.getValues("lastName")?.[0]?.toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Image
            </Button>
            <Input
              type="file"
              id="picture"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handlePictureChange}
            />
             {/* No direct FormField for file, handled manually. Can add custom error display if needed. */}
          </div>

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Jane" {...field} />
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
                  <Input placeholder="e.g., Doe" {...field} />
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
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="e.g., (555) 123-4567" {...field} />
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
                  <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} />
                </FormControl>
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
                    defaultValue={field.value}
                    className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4 md:justify-around"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="male" />
                      </FormControl>
                      <FormLabel className="font-normal">Male</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="female" />
                      </FormControl>
                      <FormLabel className="font-normal">Female</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="other" />
                      </FormControl>
                      <FormLabel className="font-normal">Other</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Save Profile
          </Button>
        </form>
      </Form>
    </OnboardingCard>
  );
}