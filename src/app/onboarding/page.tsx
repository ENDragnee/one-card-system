// app/onboarding/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { LoginPage } from "@/components/LoginPage";
import { ProfileFormPage } from "./_components/ProfileFormPage";
import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If a Registrar is logged in and somehow lands here, redirect them.
    // Middleware should primarily handle this, but this is a client-side safeguard.
    if (status === "authenticated" && session?.user?.role === Role.Registrar) {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <LoadingSpinner/>; // Or a proper skeleton loader
  }

  // If authenticated as Student, show onboarding content
  if (session?.user?.role === Role.Student) {
    return (
      <div className="flex flex-col justify-center items-center mx-auto p-4">
        <ProfileFormPage onProfileSaveSuccess={() => { console.log("Save Success"); }} initialData={{ name: session.user.name || "" }} />
        {/* Add any other onboarding components or steps here */}
      </div>
    );
  }

  // If unauthenticated, or any other case (e.g. no role but authenticated), show LoginPage.
  // This includes status === "unauthenticated"
  return <LoginPage />;
}