// components/layout/page-header.tsx
"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import React from "react";
import { signOut } from "next-auth/react";

interface PageHeaderProps {
  title: string;
  showSearch?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onSearchSubmit?: () => void;
  placeholder?: string;
}

export function PageHeader({
  title,
  showSearch = false,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  placeholder = "Search...",
}: PageHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {showSearch && (
        <div className="flex w-full md:w-auto items-center space-x-2">
          <Input
            type="search"
            placeholder={placeholder}
            className="md:w-[250px] lg:w-[300px]"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && onSearchSubmit) {
                onSearchSubmit();
              }
            }}
          />
          {onSearchSubmit && (
            <Button onClick={onSearchSubmit} variant="default">
              <Icons.Search className="h-4 w-4 mr-2 md:hidden" />
              <span className="hidden md:inline">Search</span>
            </Button>
          )}
          <Button variant="outline" className="ml-2 hover:bg-red-600 hover:text-white" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      )}
    </header>
  );
}