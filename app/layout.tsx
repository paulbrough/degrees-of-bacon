import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { AuthButton } from "@/components/AuthButton";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Degrees of Bacon",
  description: "Discover connections between your favorite movies, TV shows, and actors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
            <Link href="/" className="shrink-0 text-lg font-bold tracking-tight hover:text-accent-hover transition-colors">
              Degrees of Bacon
            </Link>
            <SearchBar />
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/watchlist" className="hidden text-muted hover:text-foreground transition-colors sm:block">
                Watch List
              </Link>
              <Link href="/compare" className="hidden text-muted hover:text-foreground transition-colors sm:block">
                Compare
              </Link>
              <AuthButton />
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-border py-6">
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
      </body>
    </html>
  );
}
