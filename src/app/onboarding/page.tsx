// app/onboarding/page.tsx
"use client";

import React, { useState } from 'react';
import { LoginPage } from '@/components/LoginPage';
import { ChangePasswordPage } from './_components/ChangePasswordPage';
import { ProfileFormPage } from './_components/ProfileFormPage';
import { Button } from '@/components/ui/button';

type OnboardingStep = "login" | "change-password" | "profile" | "completed";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("login");

  const handleLoginSuccess = () => {
    setCurrentStep("change-password");
  };

  const handleChangePasswordSuccess = () => {
    setCurrentStep("profile");
  };

  const handleProfileSaveSuccess = () => {
    setCurrentStep("completed");
    // Optionally redirect or show a final message
    // For now, just log and show a completed message
    console.log("Onboarding completed!");
  };

  const renderStep = () => {
    switch (currentStep) {
      case "login":
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case "change-password":
        return <ChangePasswordPage onChangePasswordSuccess={handleChangePasswordSuccess} />;
      case "profile":
        return <ProfileFormPage onProfileSaveSuccess={handleProfileSaveSuccess} />;
      case "completed":
        return (
          <div className="text-center p-10 bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Onboarding Complete!</h2>
            <p className="text-gray-700">Thank you for setting up your account.</p>
            <Button onClick={() => setCurrentStep("login")} className="mt-6">
                Start Over (Demo)
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted">
      {renderStep()}
    </main>
  );
}