"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-medium text-slate-700">Kontrakan App</p>
        <p>&copy; {new Date().getFullYear()} Kontrakan App</p>
      </div>
    </footer>
  );
}
