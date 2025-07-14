
"use client";

import type React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusSquare, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
interface HeaderProps {
  onAddNote: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onAddNote, searchTerm, onSearchChange, signOut, user }) => {
  console.log("Header rendered with user:", user);
  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center gap-4">
        <h1 className="text-2xl font-headline font-semibold">NoteLink</h1>
        <div className="relative flex-grow max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/70 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search by title or tag..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-primary-foreground/10 placeholder:text-primary-foreground/60 text-primary-foreground focus:bg-primary-foreground/20 border-transparent focus:border-accent focus:ring-accent"
            aria-label="Search notes"
          />
        </div>
        <Button onClick={onAddNote} variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusSquare className="mr-2 h-5 w-5" />
          New Note
        </Button>
        {/* logout menu */}
        <DropdownMenu className="ml-4">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-2">
              <span className="sr-only">Open user menu</span>
              <img src="https://preview.redd.it/v82wta66q5971.jpg?auto=webp&s=8d13ea0bb4de95723ad5ef7758be71a39bebe35a" alt="User Avatar" className="h-8 w-8 rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
