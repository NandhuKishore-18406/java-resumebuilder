import type { Metadata } from "next";
import { Comfortaa, Crimson_Text } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

// Comfortaa for headings/UI
const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

// Crimson Text for resume body
const crimsonText = Crimson_Text({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Resume Builder — Auto Update and Generation",
  description: "Automatically build and update your academic resume with ORCID sync, certificate management, and PDF export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        comfortaa.variable,
        crimsonText.variable
      )}
    >
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}