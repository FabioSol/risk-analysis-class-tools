"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, Mail, LineChart } from "lucide-react";
import { motion } from "framer-motion";


const routes = [
    { path: "/", name: "Home", icon: <Home size={24} /> },
    { path: "/about", name: "About", icon: <Info size={24} /> },
    { path: "/variance-simulator", name: "Variance Simulator", icon: <LineChart size={24} /> },
    { path: "/contact", name: "Contact", icon: <Mail size={24} /> },
];

export default function Sidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="w-16">
            <nav
                className={`fixed left-0 h-full bg-neutral-200 dark:bg-neutral-950 transition-all duration-300 shadow-md
                    ${sidebarOpen ? "w-60 p-2.5" : "w-15 p-2.5"}`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                <ul className="space-y-1">
                    {routes.map(({ path, name, icon }) => (
                        <li key={path} className="relative" onClick={(e)=>{e.stopPropagation()}}>
                            <Link
                                href={path}
                                className={`flex p-2 rounded transition-colors 
                                    ${pathname === path ? "bg-neutral-300 dark:bg-neutral-800" : "hover:bg-neutral-300 dark:hover:bg-neutral-800"}`}
                            >
                                {/* Always show icon */}
                                {icon}

                                {/* Only show name when sidebar is open, absolute positioning */}
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: sidebarOpen ? 1 : 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: sidebarOpen ? 0.3 : 0.1, delay: sidebarOpen ? 0.1 : 0 }}
                                    className={`absolute left-10 opacity-0 ${sidebarOpen ? "opacity-100" : ""} transition-all duration-300`}
                                >
                                    {name}
                                </motion.span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
