// app/onboarding/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { LoginPage } from "@/components/LoginPage";
import { ProfileFormPage } from "./_components/ProfileFormPage";
import { ChangePasswordPage } from "./_components/ChangePasswordPage";
import { Role } from "@prisma/client"; // Make sure this import is correct and Role enum is available
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function OnboardingPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  const [passwordUpdateFlowCompleted, setPasswordUpdateFlowCompleted] = useState(false);

  // Main redirection logic based on session state
  useEffect(() => {
    console.log("OnboardingPage: Main useEffect triggered. Status:", status); // Log 1
    if (session) {
      console.log("OnboardingPage: Session data in main useEffect:", JSON.stringify(session.user, null, 2)); // Log 2
    }

    if (status === "authenticated" && session?.user) {
      const user = session.user;
      console.log("OnboardingPage: Authenticated. User role:", user.role, "User completed:", user.completed); // Log 3

      if (user.role === Role.Registrar) {
        console.log("OnboardingPage: Redirecting Registrar to /admin/dashboard"); // Log 4
        router.replace("/admin/dashboard");
        return;
      }

      if (user.role === Role.Student) {
        console.log("OnboardingPage: User is Student."); // Log 5
        if (user.completed === true) {
          console.log("OnboardingPage: Student is completed. Redirecting to /summary"); // Log 6
          router.replace("/summary");
          return;
        } else {
          console.log("OnboardingPage: Student is NOT completed. Will render onboarding steps."); // Log 7
        }
      }
    } else if (status === "loading") {
      console.log("OnboardingPage: Session status is loading in main useEffect."); // Log 8
    } else {
      console.log("OnboardingPage: Session status is unauthenticated or session.user is null in main useEffect."); // Log 9
    }
  }, [session, status, router]);

  // Effect to set passwordUpdateFlowCompleted
  useEffect(() => {
    if (session?.user?.changedPassword === true) {
      // console.log("OnboardingPage: Setting passwordUpdateFlowCompleted to true from session.");
      setPasswordUpdateFlowCompleted(true);
    }
  }, [session?.user?.changedPassword]);


  console.log("OnboardingPage: Rendering component. Status:", status); // Log 10
  if (status === "loading") {
    console.log("OnboardingPage: Rendering LoadingSpinner (status is loading)."); // Log 11
    return <LoadingSpinner />;
  }

  if (!session || !session.user) {
    console.log("OnboardingPage: Rendering LoginPage (no session or no session.user). Session:", session); // Log 12
    return <LoginPage />;
  }

  const user = session.user;
  console.log("OnboardingPage: Rendering main content. User role:", user.role, "User completed:", user.completed, "User changedPassword:", user.changedPassword, "passwordUpdateFlowCompleted:", passwordUpdateFlowCompleted); // Log 13

  if (user.role === Role.Student) {
    // Main useEffect should have redirected if user.completed was true.
    // If here, user.completed should be false.
    if (user.completed === true) {
      // This block should ideally not be reached if the main useEffect is working correctly for completed students.
      // This acts as a fallback or indicates a potential timing issue.
      console.warn("OnboardingPage: Fallback - Student is completed but main useEffect didn't redirect. Redirecting now."); // Log 14
      router.replace("/summary");
      return <LoadingSpinner />; // Show loading while redirecting
    }


    const needsPasswordChange =
      user.changedPassword === false && !passwordUpdateFlowCompleted;
    console.log("OnboardingPage: Student needsPasswordChange:", needsPasswordChange); // Log 15

    if (needsPasswordChange) {
      console.log("OnboardingPage: Rendering ChangePasswordPage."); // Log 16
      return (
        <div className="flex flex-col justify-center items-center mx-auto p-4 min-h-screen">
          <ChangePasswordPage
            onChangePasswordSuccess={async () => {
              console.log("OnboardingPage: ChangePasswordSuccess triggered."); // Log 17
              setPasswordUpdateFlowCompleted(true);
              await updateSession();
            }}
          />
        </div>
      );
    } else if (
      (user.changedPassword === true || passwordUpdateFlowCompleted === true)
      // && user.completed === false // Implicitly true if we are here
    ) {
      console.log("OnboardingPage: Rendering ProfileFormPage."); // Log 18
      return (
        <div className="flex flex-col justify-center items-center mx-auto p-4 min-h-screen">
          <ProfileFormPage
            onProfileSaveSuccess={async () => {
              console.log("OnboardingPage: ProfileSaveSuccess triggered. Updating session..."); // Log 19
              await updateSession();
            }}
            initialData={{
              name: user.name || "",
              email: user.email || "",
              // Add other fields from your session.user type that ProfileFormPage expects
            }}
          />
        </div>
      );
    } else {
      console.warn("OnboardingPage: Student in an unexpected state render path.", user); // Log 20
      return <LoadingSpinner />;
    }
  }

  console.log("OnboardingPage: Rendering LoginPage (fallback, user not student or other condition)."); // Log 21
  return <LoginPage />;
}