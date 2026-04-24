import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "AIHeal · Your AI Health Copilot",
  description:
    "AI analyzes your health signals, detects risks, and generates actionable insights for everyday wellbeing.",
  metadataBase: new URL("https://aiheal.app"),
  openGraph: {
    title: "AIHeal · Your AI Health Copilot",
    description:
      "Understand your body through data, not guesswork. AI-powered personal health reports.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen font-sans">
        <Providers>
          <Nav />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
