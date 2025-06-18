// app/validator/page.tsx
"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, XCircle, CheckCircle, ScanLine } from "lucide-react";

// This type defines the structure of the user data we expect from the API
type ScannedUser = {
  name: string | null;
  username: string;
  photo: string | null;
  department: string | null;
  yearLabel: string; // We get this pre-formatted from the API
  email: string;
  completed: boolean;
};

export default function ValidatorPage() {
  const [barcodeId, setBarcodeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedUser, setScannedUser] = useState<ScannedUser | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input field on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getAvatarFallback = (name: string | null) => {
    if (!name) return "??";
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleClear = () => {
    setBarcodeId("");
    setError(null);
    setScannedUser(null);
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!barcodeId.trim()) {
      setError("Please enter a Barcode ID.");
      return;
    }

    // Reset state for a new submission
    setIsLoading(true);
    setError(null);
    setScannedUser(null);

    try {
      const response = await fetch('/api/validator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode_id: barcodeId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'An error occurred.');
      }

      setScannedUser(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user data. Please try again.');
    } finally {
      setIsLoading(false);
      // Clear input after submission for quick next scan
      setBarcodeId("");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-50 p-4 pt-10 sm:p-6 md:p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
            <ScanLine className="mx-auto h-12 w-12 text-indigo-600" />
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                Student Validator
            </h1>
            <p className="mt-2 text-sm text-gray-600">
                Enter or scan a student's barcode ID to verify their details.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="barcode-id" className="sr-only">
              Barcode ID
            </label>
            <Input
              id="barcode-id"
              ref={inputRef}
              type="text"
              placeholder="Scan or enter Barcode ID..."
              value={barcodeId}
              onChange={(e) => setBarcodeId(e.target.value)}
              disabled={isLoading}
              className="h-12 text-center text-lg"
            />
          </div>
          <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Validate"}
          </Button>
        </form>

        <div className="mt-6">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {scannedUser && (
            <>
            <Card className="overflow-hidden shadow-lg animate-in fade-in-50">
              <CardHeader className="flex flex-col items-center space-y-4 bg-gray-50 p-6 text-center">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  <AvatarImage src={scannedUser.photo || undefined} alt={scannedUser.name || "Student"} />
                  <AvatarFallback className="text-3xl">
                    {getAvatarFallback(scannedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{scannedUser.name || 'Name not available'}</CardTitle>
                  <CardDescription className="text-md text-gray-500">{scannedUser.username}</CardDescription>
                </div>
                 <div className="flex items-center text-green-600 pt-2">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-semibold">Verified Student</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-500">Department</span>
                    <span className="font-semibold text-gray-800 text-right">{scannedUser.department || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-500">Year</span>
                    <span className="font-semibold text-gray-800">{scannedUser.yearLabel}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-500">Email</span>
                    <span className="font-semibold text-gray-800">{scannedUser.email}</span>
                </div>
              </CardContent>
            </Card>
             <Button onClick={handleClear} variant="outline" className="mt-4 w-full">
                Scan Another ID
             </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}