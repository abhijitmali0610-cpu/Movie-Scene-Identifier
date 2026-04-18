import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "./context/FavoritesContext";
import { auth, signIn, signOut } from "@/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movie Scene Identifier",
  description: "Find movies from screenshots using top-class AI tools.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-50 selection:bg-purple-500/30 selection:text-purple-200">
        <header className="w-full border-b border-white/10 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between font-sans">
            <a href="/" className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>
               Visual Search AI
            </a>
            <nav className="flex items-center gap-6 text-sm font-medium text-neutral-300">
               <a href="/" className="hover:text-white transition-colors">Home</a>
               <a href="/favorites" className="hover:text-white transition-colors">Favorites</a>
               <a href="/about" className="hover:text-white transition-colors">About Us</a>
               <a href="/contact" className="hover:text-white transition-colors">Contact Us</a>
               
               {session?.user ? (
                 <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
                   {session.user.image && <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20" />}
                   <form action={async () => { "use server"; await signOut(); }}>
                      <button type="submit" className="text-sm font-semibold hover:text-white transition-colors">Sign Out</button>
                   </form>
                 </div>
               ) : (
                 <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
                    <form action={async () => { "use server"; await signIn("google"); }}>
                      <button type="submit" className="text-sm font-semibold px-4 py-1.5 bg-white text-black rounded-full hover:bg-neutral-200 transition-colors shadow-lg">Sign In</button>
                    </form>
                 </div>
               )}
            </nav>
          </div>
        </header>
        <div className="flex-1">
          <FavoritesProvider>
            {children}
          </FavoritesProvider>
        </div>
      </body>
    </html>
  );
}
