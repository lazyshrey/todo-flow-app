import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL("https://todoflow.dev"),
  title: "Todo Flow | Tasks That Flow Everywhere You Work",
  description: "One unified, real-time synchronized todo application connecting your Web Dashboard, Discord Bot, and AI Coding Assistants (MCP Server) seamlessly.",
  keywords: ["todo", "task manager", "discord bot", "mcp server", "developer productivity", "clerk auth", "nextjs app router", "monochrome UI"],
  authors: [{ name: "Todo Flow Team" }],
  icons: {
    icon: "/logo_light.png",
    shortcut: "/logo_light.png",
    apple: "/logo_light.png",
  },
  openGraph: {
    title: "Todo Flow | Tasks That Flow Everywhere You Work",
    description: "One unified, real-time synchronized todo application connecting your Web Dashboard, Discord Bot, and AI Coding Assistants (MCP Server) seamlessly.",
    url: "https://todoflow.dev",
    siteName: "Todo Flow",
    images: [
      {
        url: "/logo_light.png",
        width: 512,
        height: 512,
        alt: "Todo Flow Light Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Todo Flow | Tasks That Flow Everywhere You Work",
    description: "One unified, real-time synchronized todo application connecting your Web Dashboard, Discord Bot, and AI Coding Assistants (MCP Server) seamlessly.",
    images: ["/logo_light.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const savedTheme = localStorage.getItem('theme');
                    if (savedTheme === 'light' || savedTheme === 'gray' || savedTheme === 'dark') {
                      document.documentElement.classList.add('theme-' + savedTheme);
                    } else {
                      document.documentElement.classList.add('theme-dark');
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
        </head>
        <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
