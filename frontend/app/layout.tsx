import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { LocationProvider } from "@/context/LocationContext";

export const metadata: Metadata = {
  title: "SpacePulse AI",
  description: "Real-time space weather intelligence, personalized for you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LocationProvider>
          <Navbar />
          {children}
        </LocationProvider>
      </body>
    </html>
  );
}
