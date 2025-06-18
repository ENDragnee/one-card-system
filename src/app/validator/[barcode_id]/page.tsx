// app/validator/[barcode_id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, XCircle, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react"; // <-- Import useSession
import { Role } from "@prisma/client"; // <-- Import Role enum
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react"; // <-- Import ShieldAlert for access denied

// Updated type to reflect the API's response structure
type ValidationResult = {
  actionStatus: 'CHECKED_IN' | 'ALREADY_ENTERED';
  message: string;
  user: {
    name: string | null;
    username: string;
    photo: string | null;
    department: string | null;
    yearLabel: string;
    email: string;
  };
};

// --- HELPER COMPONENTS FOR EACH STATE ---

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-gray-500">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      <p className="text-lg font-medium">Validating & Checking In...</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="w-full space-y-4">
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Validation Failed</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <Link href="/" className="inline-flex w-full items-center justify-center rounded-md bg-primary py-2 px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Go to Homepage
      </Link>
    </div>
  );
}

// Reusable user card component
function UserProfileCard({ user, statusContent }: { user: ValidationResult['user'], statusContent: React.ReactNode }) {
    const getAvatarFallback = (name: string | null) => {
        if (!name) return "??";
        const parts = name.split(' ');
        if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <Card className="overflow-hidden shadow-lg">
            <CardHeader className="flex flex-col items-center space-y-4 bg-gray-50 p-6 text-center">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                    <AvatarImage src={user.photo || undefined} alt={user.name || "Student"} />
                    <AvatarFallback className="text-3xl">{getAvatarFallback(user.name)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <CardTitle className="text-2xl">{user.name || 'Name not available'}</CardTitle>
                    <CardDescription className="text-md text-gray-500">{user.username}</CardDescription>
                </div>
                {statusContent}
            </CardHeader>
            <CardContent className="space-y-4 p-6">
                <div className="flex justify-between border-b pb-2"><span className="font-medium text-gray-500">Department</span><span className="font-semibold text-gray-800 text-right">{user.department || 'N/A'}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="font-medium text-gray-500">Year</span><span className="font-semibold text-gray-800">{user.yearLabel}</span></div>
                <div className="flex justify-between"><span className="font-medium text-gray-500">Email</span><span className="font-semibold text-gray-800">{user.email}</span></div>
            </CardContent>
        </Card>
    )
}


function AccessDeniedState({ message, showLoginButton = false }: { message: string, showLoginButton?: boolean }) {
  return (
    <div className="w-full space-y-4 text-center">
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      {showLoginButton && (
        <Button asChild className="w-full">
            <Link href="/api/auth/signin">Sign In</Link>
        </Button>
      )}
      <Button asChild variant="outline" className="w-full">
         <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Homepage
        </Link>
      </Button>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---

export default function ValidatorResultPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const params = useParams();
  const { data: session, status: sessionStatus } = useSession(); // <-- Get session status


  useEffect(() => {
    // Don't fetch anything until the session is loaded and verified
    if (sessionStatus === 'loading') {
      return;
    }

    // If authenticated and is a Registrar, proceed to fetch
    if (sessionStatus === 'authenticated' && session.user.role === Role.Registrar) {
      const barcodeId = params.barcode_id;
      if (!barcodeId || typeof barcodeId !== 'string') {
        setError("Invalid Barcode ID in URL.");
        setIsLoading(false);
        return;
      }
      
      const fetchUserData = async () => {
        setIsLoading(true);
        setError(null);
        setValidationResult(null);
        try {
          const response = await fetch('/api/validator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode_id: barcodeId }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message || 'An unknown error occurred.');
          setValidationResult(result);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUserData();
    } else {
        // If not a registrar or not authenticated, stop loading.
        // The render block will handle showing the Access Denied message.
        setIsLoading(false);
    }

  }, [params.barcode_id, session, sessionStatus]);

  // --- RENDER LOGIC ---

  if (sessionStatus === 'loading') {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (sessionStatus === 'unauthenticated') {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
             <AccessDeniedState message="You must be signed in to access this page." showLoginButton={true} />
        </div>
      );
  }

  if (session?.user.role !== Role.Registrar) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
             <AccessDeniedState message="You do not have permission to view this page. Access is restricted to Registrars." />
        </div>
    );
  }
  
  // If we reach here, user is a Registrar. Show the validator UI.
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md animate-in fade-in-50">
        {isLoading && <LoadingState />}
        {error && <ErrorState message={error} />}
        {validationResult && (
           <div className="space-y-4">
            {validationResult.actionStatus === 'CHECKED_IN' && (
              <UserProfileCard 
                user={validationResult.user}
                statusContent={
                  <div className="flex items-center rounded-full bg-green-100 px-3 py-1 text-green-700">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-semibold text-md">Checked In Successfully</span>
                  </div>
                }
              />
            )}

            {validationResult.actionStatus === 'ALREADY_ENTERED' && (
              <UserProfileCard
                user={validationResult.user}
                statusContent={
                  <div className="flex items-center rounded-full bg-yellow-100 px-3 py-1 text-yellow-800">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span className="font-semibold text-md">Already Entered</span>
                  </div>
                }
              />
            )}
             <Link href="/" className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                Return to Homepage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}