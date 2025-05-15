// src/app/admin/layout.tsx
import { Sidebar } from "@/components/layout/sidebar"; // Corrected import path if @ is src
import { MobileSidebar } from "@/components/layout/mobile-sidebar"; // Assuming you have a mobile sidebar component
import { UserProfileNav } from "@/components/layout/user-profile-nav"; // Corrected import path if @ is src

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Optional: Header for Admin Section (e.g., user profile, mobile nav trigger) */}
        
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-6 md:justify-end">
          <div className="md:hidden">
            <MobileSidebar />
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <UserProfileNav />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 lg:p-10">
          {children}
        </main>

        {/* Optional: Footer for Admin Section */}
        
        <footer className="border-t bg-card p-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Samara University Registrar Portal
        </footer>
       
      </div>
    </div>
  );
}