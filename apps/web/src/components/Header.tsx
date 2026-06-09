"use client";

import { useState, useEffect, useRef } from "react";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, LogIn, Palette } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

export default function Header() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const { theme, changeTheme } = useTheme();
  
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  
  const logoSrc = theme === "light" ? "/logo_dark.png" : "/logo_light.png";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full flex justify-center pt-5 pb-2 px-4 pointer-events-none">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_0_rgba(255,255,255,0.05)] pointer-events-auto transition-all duration-300 relative overflow-visible"
      >
        {/* Liquid Glass Highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none rounded-full" />
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src={logoSrc}
              alt="Todo Flow Logo"
              className="h-10 w-10 object-contain transition-transform group-hover:scale-105 duration-300"
            />
            <span className="text-xl font-bold tracking-tight text-zinc-100 hover:text-white transition-colors duration-300">
              Todo Flow
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            {/* Theme Selector Dropdown */}
            <div className="relative flex items-center" ref={themeDropdownRef}>
              <button
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-all cursor-pointer mr-1"
                title="Change Theme"
              >
                <Palette className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {isThemeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-36 rounded-2xl border border-white/10 bg-zinc-900/90 backdrop-blur-xl p-1.5 shadow-xl z-50 text-left"
                  >
                    {(["dark", "light", "gray"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          changeTheme(t);
                          setIsThemeOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                          theme === t
                            ? "bg-white text-zinc-950 font-bold"
                            : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                        }`}
                      >
                        {t === "gray" ? "Discord Gray" : t}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isLoaded && isSignedIn ? (
              <>
                <Link
                  href="/"
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 border ${
                    pathname === "/"
                      ? "bg-white/10 text-zinc-100 border-white/10"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border-transparent"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/docs"
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 border ${
                    pathname === "/docs"
                      ? "bg-white/10 text-zinc-100 border-white/10"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border-transparent"
                  }`}
                >
                  Docs
                </Link>
                <Link
                  href="/settings"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 border ${
                    pathname === "/settings"
                      ? "bg-white/10 text-zinc-100 border-white/10"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border-transparent"
                  }`}
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
                <div className="ml-2 flex items-center">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8 ring-1 ring-white/10 rounded-full hover:ring-white/20 transition-all duration-300",
                      },
                    }}
                  />
                </div>
              </>
            ) : isLoaded ? (
              <>
                <Link
                  href="/docs"
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 border ${
                    pathname === "/docs"
                      ? "bg-white/10 text-zinc-100 border-white/10"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border-transparent"
                  }`}
                >
                  Docs
                </Link>
                <SignInButton mode="modal">
                  <button className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-zinc-950 bg-white hover:bg-zinc-100 transition-all duration-300 cursor-pointer shadow-md active:scale-95">
                    <LogIn className="h-3.5 w-3.5 stroke-[2.5]" />
                    Sign In
                  </button>
                </SignInButton>
              </>
            ) : null}
          </nav>
        </div>
      </motion.header>
    </div>
  );
}
