import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Colour Works Manager Coach",
  description: "A guided leadership coaching journey for managers using confirmed behavioural preference context."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#123c69"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
