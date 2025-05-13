"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Logo from "./ui/Logo";
import { universities } from "../types/list-of-uni";

export default function SignIn() {
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    try {
      const result = await signIn("credentials", {
        university: selectedUniversity,
        password,
        redirect: false,
        callbackUrl: "/"
      });
  
      if (result?.error) {
        setError("Invalid credentials");
      } else if (result?.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An error occurred during sign in");
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
          <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <select
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 ${
                  isDarkTheme
                    ? "bg-[#373e47] text-white focus:ring-[#5294e2]"
                    : "bg-[#f0f4f8] text-black focus:ring-[#3367d6]"
                }`}
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                required
              >
                <option value="">Select University</option>
                {universities.map((university) => (
                  <option key={university.name} value={university.name}>
                    {university.name}
                  </option>
                ))}
              </select>
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
            <div className="flex items-center justify-between mb-6">
              <button
                className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-transform duration-300 ease-in-out transform hover:scale-105 ${
                  isDarkTheme
                    ? "bg-[#5294e2] hover:bg-[#4a84c9] text-white"
                    : "bg-[#3367d6] hover:bg-[#2851a3] text-white"
                }`}
                type="submit"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#cccccc] text-center text-[#003366] shadow-lg">
          <p className="text-base font-medium">
            &copy; ASCII Technologies <span className="text-[#b8860b]">2024</span>
          </p>
      </footer>
    </div>
  );
}