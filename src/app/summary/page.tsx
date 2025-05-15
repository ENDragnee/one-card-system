// app/summary/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import LoadingSpinner from "@/components/LoadingSpinner";
import Image from "next/image";
import { Role } from "@prisma/client"; // Only Role needed here from prisma client
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

type SummaryUserData = {
  name: string | null;
  username: string;
  email: string;
  gender: string | null;
  phone: string | null;
  photo: string | null;
  barcode_id: string | null;
  batch: string | null;
  department: string | null;
  // `role` and `completed` are validated by the API, not strictly needed in this type for display
};

export default function SummaryPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const barcodeRef = useRef<SVGSVGElement | null>(null);

  const [summaryData, setSummaryData] = useState<SummaryUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Unified loading state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Step 1: Handle session status
    if (sessionStatus === "loading") {
      setIsLoading(true); // Keep loading true while session is resolving
      return;
    }

    if (sessionStatus === "unauthenticated") {
      router.replace("/onboarding");
      return;
    }

    // Step 2: Session is authenticated, proceed to fetch data
    if (sessionStatus === "authenticated" && session?.user) {
      // Client-side check (optional but good for quick UI update)
      // Ensure the user is a student to even attempt fetching summary.
      // The API will do the definitive check for `completed` status.
      if (session.user.role !== Role.Student) {
        // If not a student, redirect to a generic dashboard or appropriate page
        // For example, a registrar might have landed here by mistake.
        router.replace("/admin/dashboard"); // Or a generic /dashboard
        return;
      }

      // If we are here, user is authenticated and is a Student.
      // Now, fetch the summary details.
      setIsLoading(true); // Set loading for the API call
      setError(null);

      console.log("Attempting to fetch /api/user/summary-details"); // Debug log

      fetch("/api/user/summary-details")
        .then(async (res) => {
          console.log("API Response Status:", res.status); // Debug log
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: "Failed to parse error response from API" }));
            console.error("API Error Data:", errorData); // Debug log
            throw new Error(errorData.error || `API Error: ${res.status}`);
          }
          return res.json();
        })
        .then((data: SummaryUserData) => {
          console.log("API Success Data:", data); // Debug log
          setSummaryData(data);
          setError(null); // Clear any previous error
        })
        .catch((err) => {
          console.error("Failed to fetch summary data (catch block):", err); // Debug log
          setError(err.message || "Could not load summary information.");
          // If API explicitly denies access for a student (e.g. profile not completed)
          // redirect them appropriately, perhaps back to onboarding.
          if (err.message.includes("Access denied") || err.message.includes("403")) {
            router.replace("/onboarding"); // Student not fully onboarded, send back
          } else if (err.message.includes("401")) { // Unauthorized (e.g. session became invalid)
            router.replace("/onboarding");
          }
          // For other errors, we'll show the error message on the page.
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [session, sessionStatus, router]); // Dependencies for the main effect

  // Effect to generate barcode
  useEffect(() => {
    if (!isLoading && summaryData?.barcode_id && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, summaryData.barcode_id, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 16,
        });
      } catch (e) {
        console.error("Barcode generation error:", e);
        if (barcodeRef.current) {
            barcodeRef.current.innerHTML = '<text fill="red">Error generating barcode.</text>';
        }
      }
    }
  }, [isLoading, summaryData?.barcode_id]); // Re-run if data or loading state changes

  // --- Render Logic ---
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-red-600 text-xl mb-4">Error:</p>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => {
              // Determine where to redirect based on error or session
              if (session?.user?.role === Role.Student && (error.includes("Access denied") || error.includes("403"))) {
                router.push("/onboarding");
              } else {
                router.push(session?.user?.role === Role.Registrar ? "/admin/dashboard" : "/onboarding");
              }
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {session?.user?.role === Role.Student && (error.includes("Access denied") || error.includes("403"))
              ? "Go to Onboarding"
              : "Go to Dashboard"}
          </button>
        </div>
      </div>
    );
  }

  if (!summaryData) {
     // This case should ideally be rare if loading and error states are handled correctly.
     // Could mean user is authenticated Student, API call made, but no data and no error (e.g. API bug returning 200 with empty/null)
     console.warn("SummaryPage: summaryData is null after loading and no error. Session:", session);
     return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <p>Could not load summary data. Please try again later.</p>
        </div>
     );
  }

  // If we reach here, isLoading is false, no error, and summaryData is available
  const { name, email, department, batch, barcode_id, photo, username } = summaryData;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
    <Button variant="outline" className="mb-4" onClick={() => signOut()}>Sign out</Button>
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 w-full max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
          Student Summary
        </h1>

        {photo && (
          <div className="flex justify-center mb-6">
            <Image
              src={photo}
              alt={name || "User photo"}
              width={128}
              height={128}
              className="rounded-full object-cover"
            />
          </div>
        )}

        <div className="space-y-3 text-gray-700 mb-6">
          <p><strong>Name:</strong> {name || "N/A"}</p>
          <p><strong>Username:</strong> {username || "N/A"}</p>
          <p><strong>Email:</strong> {email || "N/A"}</p>
          <p><strong>Department:</strong> {department || "N/A"}</p>
          <p><strong>Batch:</strong> {batch || "N/A"}</p>
        </div>

        {barcode_id ? (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Your Barcode
            </h2>
            <svg ref={barcodeRef} className="w-full max-w-xs"></svg>
          </div>
        ) : (
          <p className="text-center text-red-500 font-semibold">
            Barcode ID not available. Please contact administration.
          </p>
        )}

        <div className="mt-8 text-center">
            <button
                onClick={() => router.push(session?.user?.role === Role.Registrar ? "/admin/dashboard" : "/summary")} // Generic student dashboard
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
               {session?.user?.role === Role.Registrar ? "Go to Dashboard" : "Refresh"}
            </button>
        </div>
      </div>
      <footer className="text-center mt-8 text-gray-600">
        <p>© {new Date().getFullYear()} Your Institution. All rights reserved.</p>
      </footer>
    </div>
  );
}