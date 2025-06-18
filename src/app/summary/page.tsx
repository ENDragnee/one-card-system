// app/summary/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
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
  barcode_id: string | null; // This ID will now be used for the QR Code
  batch: string | null;
  department: string | null;
  // `role` and `completed` are validated by the API, not strictly needed in this type for display
};

export default function SummaryPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  // UPDATED: The ref is now for a <canvas> element for the QR code
  const qrCodeRef = useRef<HTMLCanvasElement | null>(null);

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
      if (session.user.role !== Role.Student) {
        router.replace("/admin/dashboard"); // Or a generic /dashboard
        return;
      }

      setIsLoading(true);
      setError(null);

      console.log("Attempting to fetch /api/user/summary-details");

      fetch("/api/user/summary-details")
        .then(async (res) => {
          console.log("API Response Status:", res.status);
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: "Failed to parse error response from API" }));
            console.error("API Error Data:", errorData);
            throw new Error(errorData.error || `API Error: ${res.status}`);
          }
          return res.json();
        })
        .then((data: SummaryUserData) => {
          console.log("API Success Data:", data);
          setSummaryData(data);
          setError(null);
        })
        .catch((err) => {
          console.error("Failed to fetch summary data (catch block):", err);
          setError(err.message || "Could not load summary information.");
          if (err.message.includes("Access denied") || err.message.includes("403")) {
            router.replace("/onboarding");
          } else if (err.message.includes("401")) {
            router.replace("/onboarding");
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [session, sessionStatus, router]);

  // UPDATED: Effect to generate QR code instead of a barcode
  useEffect(() => {
    if (!isLoading && summaryData?.barcode_id && qrCodeRef.current) {
      QRCode.toCanvas(qrCodeRef.current, `${process.env.NEXT_PUBLIC_VAILDATOR_URL}${summaryData.barcode_id}`, {
        width: 256, // A good size for QR codes
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }, (err) => {
        if (err) {
          console.error("QR Code generation error:", err);
          // Optional: Display an error message directly on the canvas
          if (qrCodeRef.current) {
              const ctx = qrCodeRef.current.getContext('2d');
              if (ctx) {
                  ctx.clearRect(0, 0, qrCodeRef.current.width, qrCodeRef.current.height);
                  ctx.font = '16px sans-serif';
                  ctx.fillStyle = 'red';
                  ctx.textAlign = 'center';
                  ctx.fillText('Error generating QR.', qrCodeRef.current.width / 2, 20);
              }
          }
        }
      });
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
     console.warn("SummaryPage: summaryData is null after loading and no error. Session:", session);
     return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <p>Could not load summary data. Please try again later.</p>
        </div>
     );
  }

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

        {/* UPDATED: This section now renders the QR Code */}
        {barcode_id ? (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Your QR Code
            </h2>
            {/* Replaced the <svg> element with a <canvas> element for the QR code */}
            <canvas ref={qrCodeRef}></canvas>
          </div>
        ) : (
          <p className="text-center text-red-500 font-semibold">
            ID for QR Code not available. Please contact administration.
          </p>
        )}

        <div className="mt-8 text-center">
            <button
                onClick={() => router.push(session?.user?.role === Role.Registrar ? "/admin/dashboard" : "/summary")}
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