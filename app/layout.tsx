import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { AuthButton } from "@/components/AuthButton";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Degrees of Bacon",
  description:
    "Discover connections between your favorite movies, TV shows, and actors",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col`}
      >
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
            <Link
              href="/"
              className="shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src="/bacon.svg"
                alt="Degrees of Bacon"
                className="h-8 w-8 brightness-0 invert"
              />
            </Link>
            <div className="hidden sm:block sm:flex-1">
              <SearchBar />
            </div>
            <nav className="hidden items-center gap-4 text-sm sm:flex">
              <Link
                href="/seenit"
                className="text-muted hover:text-foreground transition-colors"
              >
                Seen It
              </Link>
              <Link
                href="/compare"
                className="text-muted hover:text-foreground transition-colors"
              >
                Compare
              </Link>
              <AuthButton />
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-24 sm:pb-8">
          {children}
        </main>

        <footer className="hidden border-t border-border py-6 sm:block">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 text-sm text-muted">
            <span>Powered by</span>
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover transition-colors"
            >
              TMDB
            </a>
          </div>
        </footer>

        <BottomNav />
      </body>
    </html>
  );
}
