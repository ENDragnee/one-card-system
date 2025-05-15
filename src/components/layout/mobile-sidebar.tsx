"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface NavItem {
  href: string;
  title: string;
  icon: keyof typeof Icons;
}

// Same navItems as your desktop sidebar
// In a real app, you might want to define this in a shared config file
// and import it in both Sidebar and MobileSidebar.
const navItems: NavItem[] = [
  { href: "/admin/dashboard", title: "Dashboard", icon: "Dashboard" },
  { href: "/admin/students", title: "Students", icon: "Students" },
  // Add more items here
];

export function MobileSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // To control sheet state for closing on nav

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden" // Only show on small screens
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-xs p-0"> {/* Or sm:max-w-sm */}
        <div className="flex flex-col h-full">
          <div className="text-xl font-semibold text-primary text-center p-6 border-b">
            Samara University Portal
          </div>
          <nav className="flex-grow p-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const IconComponent = Icons[item.icon];
                const isActive =
                  pathname === item.href ||
                  (pathname.startsWith(item.href) && item.href !== "/");

                return (
                  <li key={item.title}>
                    {/* Use SheetClose to automatically close the sheet on link click */}
                    <SheetClose asChild>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)} // Ensure sheet closes on navigation
                        className={cn(
                          "flex items-center py-3 px-4 rounded-lg font-medium transition-colors w-full",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <IconComponent className="mr-3 h-5 w-5" />
                        {item.title}
                      </Link>
                    </SheetClose>
                  </li>
                );
              })}
            </ul>
          </nav>
          {/* Optional: Add a footer or other elements at the bottom of the mobile sidebar */}
          {/* <div className="p-6 border-t">
            <p className="text-sm text-muted-foreground text-center">Mobile Footer</p>
          </div> */}
        </div>
      </SheetContent>
    </Sheet>
  );
}