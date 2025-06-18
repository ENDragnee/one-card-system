// @/components/SignupForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import Link from "next/link";

// --- UPDATED IMPORTS ---
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
import { OnboardingCard } from "@/components/OnboardingCard";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { departments, yearMap, GENDERS } from "@/types"; // Assuming constants are in @/types

// --- UPDATED ZOD SCHEMA ---
const signupFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters." })
    .regex(/^[a-zA-Z0-9_/]+$/, "Username can only contain letters, numbers, left slash and underscores."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional().or(z.literal("")), // Optional phone number
  department: z.enum(departments, {
    errorMap: () => ({ message: "Please select a department." }),
  }),
  year: z.string().refine(val => Object.keys(yearMap).includes(val), {
    message: "Please select a valid year.",
  }),
  gender: z.enum(GENDERS, {
    errorMap: () => ({ message: "Please select a gender." }),
  }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    // --- UPDATED DEFAULT VALUES ---
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phone: "",
      department: undefined,
      year: undefined,
      gender: undefined,
      password: "",
      confirmPassword: "",
    },
  });

  // --- UPDATED ONSUBMIT FUNCTION ---
  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          username: data.username,
          email: data.email,
          password: data.password,
          // Add new fields to the request body
          phone: data.phone,
          department: data.department,
          year: data.year,
          gender: data.gender,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.message || "Signup failed. Please try again.");
        if (result.errors) {
          let errorMessages = "";
          for (const key in result.errors) {
            errorMessages += `${key}: ${result.errors[key].join(', ')}\n`;
          }
          setServerError(errorMessages.trim() || result.message || "Signup failed. Please try again.");
        }
      } else {
        setSuccessMessage("Registration successful! You can now log in.");
        form.reset();
      }
    } catch (error) {
      console.error("Signup submission error:", error);
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <OnboardingCard
      title="Create an Account"
      description="Join us by filling out the form below."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-100 p-3 text-sm text-red-700" role="alert">
              {serverError.split('\n').map((line, i) => <div key={i}>{line}</div>)}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-100 p-3 text-sm text-green-700" role="alert">
              {successMessage} Click <Link href="/onboarding" className="font-medium text-green-800 underline">here to login</Link>.
            </div>
          )}
          
          {/* --- UPDATED FORM FIELDS --- */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>University ID</FormLabel>
                <FormControl>
                  <Input placeholder="ETS1015/14" {...field} disabled={isLoading} />
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
                  <Input type="email" placeholder="your@email.com" {...field} disabled={isLoading} />
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
                  <Input type="tel" placeholder="09..." {...field} value={field.value || ""} disabled={isLoading} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your department" />
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
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your Year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(yearMap).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
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
                    className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                  >
                    {GENDERS.map((genderValue) => (
                       <FormItem key={genderValue} className="flex items-center space-x-3 space-y-0">
                       <FormControl>
                         <RadioGroupItem value={genderValue} disabled={isLoading}/>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Create a password" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm your password" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading || !!successMessage}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>
      {!successMessage && (
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/onboarding" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      )}
    </OnboardingCard>
  );
}