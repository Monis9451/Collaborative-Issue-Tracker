import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Providers } from "@/lib/query/client";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  // Load the weights we actually use across the app
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Collaborative Issue Tracker",
  description: "RBAC-powered issue tracking built with Next.js, Supabase, and TanStack Query",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var stored = localStorage.getItem('cit-theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var isDark = stored === 'dark' || (!stored && prefersDark);
                document.documentElement.classList.add(isDark ? 'dark' : 'light');
              } catch(e) {}
            })();`,
          }}
        />
      </head>
      <body className={`${nunito.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

