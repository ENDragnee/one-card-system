// app/onboarding/_components/LoginPage.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { signIn } from "next-auth/react";

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

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
        redirect: false, // We will handle success/failure manually
      });

      setIsLoading(false);

      if (result?.error) {
        // Based on NextAuth.js documentation and common practice:
        // "CredentialsSignin" is a common error code for invalid credentials.
        if (result.error === "CredentialsSignin") {
          setAuthError("Invalid username or password. Please try again.");
        } else {
          setAuthError(`Login failed: ${result.error}.`);
        }
      } else if (result?.ok) {
        // Login was successful
        onLoginSuccess();
      } else {
        // This case might occur if the signIn promise resolves without error but also without ok status,
        // or if result is undefined (e.g., if the request was aborted).
        setAuthError("Login failed. Please try again.");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Sign in error:", error);
      setAuthError("An unexpected error occurred during sign in. Please try again.");
    }
  }

  return (
    <OnboardingCard
      title="Welcome Back!"
      description="Please sign in to continue."
    >
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
    </OnboardingCard>
  );
}