import type { Metadata } from "next";
import "../styles/globals.css";
import Navbar from "@/src/components/Navbar";

export const metadata: Metadata = {
  title: "Rostrum - live auctions",
  description: "Real-time collaborative auction trading floors",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
