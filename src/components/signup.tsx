"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Logo from "./ui/Logo";

export default function SignUpUniversity() {
  const router = useRouter();
  const { theme } = useTheme(); // Use theme from next-themes

  // State variables for form input and error messages
  const [universityName, setUniversityName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    // Reset error state
    setError(null);

    // Validate input
    if (!universityName || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Send request to signup API
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          universityName,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      // Redirect to success page or login page
      router.push("/auth/signin-university");
    } catch (err: any) {
      setError(err.message || "Failed to sign up.");
    }
  };

  const isDarkTheme = theme === "dark";

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 font-sans ${
        isDarkTheme
          ? "bg-gradient-to-br from-[#373e47] to-[#2f343f] text-[#d3dae3]"
          : "bg-gradient-to-br from-[#ffffff] to-[#f0f4f8] text-[#4b5162]"
      }`}
    >
      <div className="w-full max-w-md">
        <div
          className={`shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 transition-all duration-300 ${
            isDarkTheme ? "bg-[#2f343f] text-white" : "bg-white text-black"
          }`}
        >
          <div className="flex justify-center mb-8">
            <Logo />
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center">
            University Sign Up
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
          >
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            <div className="mb-4">
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 ${
                  isDarkTheme
                    ? "bg-[#373e47] text-white focus:ring-[#5294e2]"
                    : "bg-[#f0f4f8] text-black focus:ring-[#3367d6]"
                }`}
                type="text"
                placeholder="University Name"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 ${
                  isDarkTheme
                    ? "bg-[#373e47] text-white focus:ring-[#5294e2]"
                    : "bg-[#f0f4f8] text-black focus:ring-[#3367d6]"
                }`}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 ${
                  isDarkTheme
                    ? "bg-[#373e47] text-white focus:ring-[#5294e2]"
                    : "bg-[#f0f4f8] text-black focus:ring-[#3367d6]"
                }`}
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between mb-6">
              <button
                className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-transform duration-300 ease-in-out transform hover:scale-105 ${
                  isDarkTheme
                    ? "bg-[#5294e2] hover:bg-[#4a84c9] text-white"
                    : "bg-[#3367d6] hover:bg-[#2851a3] text-white"
                }`}
                type="submit"
              >
                Sign Up
              </button>
            </div>
          </form>
          <div className="text-center">
            <p className="text-sm">
              Already have an account?
              <button
                className={`font-bold ml-1 transition-colors duration-300 ${
                  isDarkTheme
                    ? "text-[#5294e2] hover:text-[#4a84c9]"
                    : "text-[#3367d6] hover:text-[#2851a3]"
                }`}
                onClick={() => router.push("/auth/signin-university")}
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
