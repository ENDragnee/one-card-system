// app/onboarding/_components/LoginPage.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Use App Router's router
import { Role } from "@prisma/client"; // Import Role enum

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

const loginFormSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

// Removed onLoginSuccess prop as redirection is handled internally
export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const { update: updateSession } = useSession(); // To refresh session after login

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false, // We handle redirection manually
      });

      setIsLoading(false);

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setAuthError("Invalid username or password. Please try again.");
        } else {
          setAuthError(`Login failed: ${result.error}. Please try again.`);
        }
      } else if (result?.ok) {
        // Login was successful, update session to get role, then redirect
        await updateSession(); // Force a session refetch to get fresh data with role
        const currentSession = await getSession(); // Fetch the latest session

        if (currentSession?.user?.role) {
          if (currentSession.user.role === Role.Student) {
            router.replace("/onboarding"); // Stay on /onboarding to see content
          } else if (currentSession.user.role === Role.Registrar) {
            router.replace("/admin/dashboard");
          } else {
            router.replace("/"); // Fallback
          }
        } else {
          setAuthError("Login successful, but role could not be determined. Redirecting to home.");
          router.replace("/");
        }
      } else {
        setAuthError("Login failed. Please try again.");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Sign in error:", error);
      setAuthError("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <div className="flex flex-col justify-center items-center my-40 p-4">
      <OnboardingCard
        title={`Welcome to ${process.env.NEXT_PUBLIC_UNI_NAME} University Card System`}
        description="Please sign in to continue."
      >
        <div className="w-full max-w-md flex flex-col space-y-4 m-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {authError && (
                <div
                  className="mb-4 rounded-md border border-red-200 bg-red-100 p-3 text-sm text-red-700"
                  role="alert"
                >
                  {authError}
                </div>
              )}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} disabled={isLoading} />
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
                      <Input type="password" placeholder="Enter your password" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </div>
      </OnboardingCard>
    </div>
  );
}