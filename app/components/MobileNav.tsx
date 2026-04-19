"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";

interface MobileNavProps {
  isSignedIn: boolean;
  userImage?: string | null;
}

export function MobileNav({ isSignedIn, userImage }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/favorites", label: "Favorites" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <div className="md:hidden flex items-center">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle mobile menu"
        className="p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-neutral-900/95 backdrop-blur-md border-b border-white/10 z-50 px-6 py-4 flex flex-col gap-4 shadow-xl">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-neutral-300 hover:text-white transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
          <div className="border-t border-white/10 pt-4 mt-1">
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                {userImage && (
                  <img src={userImage} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20" />
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm font-semibold text-neutral-300 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <a
                href="/signin"
                className="block w-full text-center text-sm font-semibold px-4 py-2 bg-white text-black rounded-full hover:bg-neutral-200 transition-colors shadow-lg"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
