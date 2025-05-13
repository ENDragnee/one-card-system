// app/onboarding/_components/OnboardingCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OnboardingCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function OnboardingCard({ title, description, children, className }: OnboardingCardProps) {
  return (
    <Card className={`w-full max-w-md ${className}`}> {/* Original was 420px, max-w-md is ~448px */}
      <CardHeader className="text-center">
        <CardTitle className="text-2xl md:text-3xl">{title}</CardTitle> {/* Adjusted font size */}
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}