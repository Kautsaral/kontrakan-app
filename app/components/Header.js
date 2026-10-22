"use client";

import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") {
    return null;
  }

  const menuItems = [
    {
      label: "Dashboard",
      href: "/",
    },
    {
      label: "Penghuni",
      href: "/penghuni",
    },
    {
      label: "Pembayaran",
      href: "/pembayaran",
    },
    {
      label: "Backup",
      href: "/backup",
    },
  ];

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

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
    <header className="sticky top-0 z-40 border-b border-blue-400 bg-[#2373F4] print:hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-4">
        {/* Brand */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-left text-lg font-bold text-white transition hover:text-[#F2F7A0] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Kontrakan App
        </button>

        {/* Navigation */}
        <nav
          aria-label="Navigasi utama"
          className="flex flex-wrap items-center gap-1.5 sm:gap-2"
        >
          {menuItems.map((item) => {
            const active = isActive(item.href);

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => router.push(item.href)}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-3 text-sm font-medium transition sm:px-4 ${
                  active
                    ? "bg-white text-[#2373F4] shadow-sm"
                    : "text-white hover:bg-[#578EF5]"
                } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="ml-1 rounded-lg border border-white/40 px-3 py-3 text-sm font-medium text-white transition hover:bg-red-500 sm:ml-2 sm:px-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
