import type { Metadata } from "next";
import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "../lib/auth-content";

export const metadata: Metadata = {
  title: "Rostrum - live auctions",
  description: "Real-time collaborative auction trading floors",
};

export default function RootLayout({ children }: { children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
