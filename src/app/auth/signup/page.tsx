// app/auth/signup/page.tsx
import { SignupForm } from "@/components/SignupForm"; // Adjust path if needed
import { Suspense } from "react"; // Optional: if OnboardingCard or SignupForm do heavy client work

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* You can wrap SignupForm with Suspense if it or its children use it */}
        <Suspense fallback={<div>Loading form...</div>}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}