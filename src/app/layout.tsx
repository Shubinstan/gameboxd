import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthContext";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const rajdhani = Rajdhani({ 
  weight: ["400", "500", "600", "700"], 
  subsets: ["latin"],
  variable: "--font-rajdhani",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Gameboxd",
  description: "A portfolio for gamers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-[#050505] text-white antialiased font-sans",
        inter.variable,
        rajdhani.variable
      )}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}