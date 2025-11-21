import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Lavishly_Yours } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lavishlyYours = Lavishly_Yours({
  variable: "--font-lavishly-yours",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Snippy - Your Personal Snippet Brain",
  description:
    "An AI-assisted snippet manager for developers. Save code, commands, and templates in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${lavishlyYours.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
