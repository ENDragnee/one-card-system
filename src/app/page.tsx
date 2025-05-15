// app/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Adjust path if needed
import { redirect } from 'next/navigation';
import { LoginPage } from '@/components/LoginPage'; // Adjust path if needed
import { Role } from '@prisma/client';

export default async function Loading() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user?.role === Role.Registrar) {
      redirect('/admin/dashboard');
    } else {
      redirect('/onboarding');
    }
  }

  // If no active session, show the login page
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse">
          Welcome to
        </h1>
        <p className="mt-2 text-3xl font-semibold text-gray-200">
          Samara University Registrar System
        </p>
      </div>
      <LoginPage />
    </main>
  );
}