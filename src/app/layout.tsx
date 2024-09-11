import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import clsx from "clsx";
import Header from "@/components/molecules/Header/Header";
import { SupabaseUserProvider } from "@/lib/providers/supabase-user-provider";
import { Toaster } from "@/components/ui/toaster";
import SupabaseListener from "@/lib/providers/supabase-listener";
import { Provider as AtomProvider } from "jotai";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EDX The School Management System - Edu_eXperience",
  description:
    "By Hadjarsi Mohamed El Fateh & Ahmed Boulaabi, Under supervision of Professor Joel Heinis @ UHA-Univ",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={clsx(inter.className, "bg-brand-bg relative")}>
        <div
          className="absolute -z-10 w-full h-full min-h-screen left-0 top-0 bottom-0 right-0"
          style={{
            backgroundImage: "url('/images/bg-dots.svg')",
            backgroundRepeat: "repeat",
          }}
        ></div>

        <ThemeProvider attribute="class" defaultTheme="dark">
          <AtomProvider>
            <SupabaseUserProvider>
              <SupabaseListener />
              <Header />
              <div>{children}</div>
              <Toaster />
            </SupabaseUserProvider>
          </AtomProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
