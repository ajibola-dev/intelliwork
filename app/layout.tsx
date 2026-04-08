import type { Metadata } from "next";
import { DM_Serif_Display, Space_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
import { Navbar } from "@/components/layout/navbar";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "IntelliWork — AI-Judged Work Marketplace",
  description:
    "Post tasks, claim work, and resolve disputes — all judged by onchain LLM consensus via GenLayer Intelligent Contracts.",
  openGraph: {
    title: "IntelliWork",
    description: "Autonomous AI-judged work marketplace with onchain dispute resolution.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${spaceMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
