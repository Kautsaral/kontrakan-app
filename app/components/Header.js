"use client";

import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Jangan tampilkan header di halaman login
  if (pathname === "/login") {
    return null;
  }

  const handleLogout = async () => {
    const response = await fetch("/api/logout", {
      method: "POST",
    });

    if (response.ok) {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4 print:hidden">
      <div>
        <h1 className="font-bold text-gray-900">Kontrakan App</h1>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        Logout
      </button>
    </header>
  );
}