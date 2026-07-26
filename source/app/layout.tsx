import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spam Shield",
  description: "Browser-based spam and phishing message checker"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
