"use client";

import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SideRays from "@/components/SideRays";

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden bg-zinc-950 select-none">
      {/* Background Helpers */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Dotted Mesh Background Pattern - Extremely Subtle & Static */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_35%,#000_50%,transparent_100%)]" />

        {/* WebGL Cascading Corner Light Rays */}
        <div className="absolute inset-x-0 top-0 h-[850px] pointer-events-none z-0 [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]">
          <SideRays
            origin="top-right"
            rayColor1="#ffffff"
            rayColor2="#71717a"
            intensity={2.2}
            opacity={0.8}
            speed={1.0}
            spread={1.8}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-3xl border border-white/10 bg-zinc-950/40 backdrop-blur-2xl p-8 shadow-2xl hover:border-white/20 transition-all duration-500">
          <SignUp
            appearance={{
              variables: {
                colorPrimary: "#fafafa",
                colorBackground: "transparent",
                colorInputBackground: "rgba(255, 255, 255, 0.05)",
                colorInputText: "#fafafa",
                colorText: "#a1a1aa",
                colorTextOnPrimaryBackground: "#09090b",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
              },
              elements: {
                card: "bg-transparent shadow-none",
                headerTitle: "text-zinc-100",
                headerSubtitle: "text-zinc-400",
                formFieldLabel: "text-zinc-400",
                formFieldInput: "border-white/10 focus:border-white/20",
                formButtonPrimary: "bg-white text-zinc-950 hover:bg-zinc-100",
                footerActionLink: "text-zinc-300 hover:text-zinc-100",
                identityPreview: "bg-white/5 border-white/10",
                dividerLine: "bg-white/10",
                dividerText: "text-zinc-500",
                socialButtonsBlockButton: "border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200 transition-all duration-300",
                socialButtonsBlockButtonText: "text-zinc-200 font-semibold",
              },
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
