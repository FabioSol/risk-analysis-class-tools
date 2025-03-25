import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Risk Analysis Class Tools",
    description: "Tools for the risk analysis course",
};



export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body
            className={`bg-gradient-to-br from-neutral-100 to-neutral-500 dark:from-neutral-900 dark:to-neutral-950 text-neutral-900 dark:text-neutral-100 ${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <header className="fixed top-0 left-0 w-full z-10 flex justify-between items-center px-4 h-14 bg-white dark:bg-neutral-950 shadow-md">
            <h1 className="text-lg font-bold">Risk Analysis Class Tools</h1>
        </header>

        <div className="flex flex-row pt-14">
            <Sidebar />
            <main className="flex-grow">
                {children}</main>
        </div>
        </body>
        </html>
    );
}