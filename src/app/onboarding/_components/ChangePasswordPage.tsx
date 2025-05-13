// app/onboarding/_components/ChangePasswordPage.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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

const changePasswordFormSchema = z.object({
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], // Path to the field to attach the error to
});

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

interface ChangePasswordPageProps {
  onChangePasswordSuccess: () => void;
}

export function ChangePasswordPage({ onChangePasswordSuccess }: ChangePasswordPageProps) {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: ChangePasswordFormValues) {
    console.log("Change password data:", data);
    // TODO: Implement actual password change logic
    onChangePasswordSuccess();
  }

  return (
    <OnboardingCard
      title="Create New Password"
      description="Your password needs to be updated for security."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter new password" {...field} />
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
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Set New Password
          </Button>
        </form>
      </Form>
    </OnboardingCard>
  );
}