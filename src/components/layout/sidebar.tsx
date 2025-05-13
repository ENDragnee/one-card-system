"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils"; // Shadcn utility for classnames

interface NavItem {
  href: string;
  title: string;
  icon: keyof typeof Icons;
}

const navItems: NavItem[] = [
  { href: "/dashboard", title: "Dashboard", icon: "Dashboard" },
  { href: "/students", title: "Students", icon: "Students" },
  // Add more items here
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 bg-card border-r flex-col p-6 space-y-8 shadow-sm">
      <div className="text-2xl font-semibold text-primary text-center">
        UniPortal
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const IconComponent = Icons[item.icon];
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");


            return (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center py-3 px-4 rounded-lg font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <IconComponent className="mr-3 h-5 w-5" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

// Optional: For smaller screens, you might want a Sheet-based sidebar
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { Menu } from "lucide-react";
// export function MobileSidebar() { /* ... similar logic with Sheet ... */ }