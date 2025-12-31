"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Menu, X, Sun, Moon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigateToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed left-0 right-0 z-50 mx-auto transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? "top-4 w-[92%] md:w-full md:max-w-6xl rounded-2xl bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5 py-2.5"
          : "top-0 w-full rounded-none py-6 bg-transparent border-b border-transparent"
      }`}
    >
      <div
        className={`flex flex-col w-full ${!isScrolled && !isMobileMenuOpen ? "max-w-7xl mx-auto" : ""}`}
      >
        <div className="px-6 flex items-center justify-between w-full">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
              <Terminal size={18} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">
              Scrapter
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How it Works", "Pricing", "Docs"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800"></div>

            <Link
              href="/login"
              className="text-sm font-semibold text-zinc-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
            >
              Log in
            </Link>
            <button
              onClick={navigateToDashboard}
              className="bg-zinc-900 dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Dashboard <ArrowRight size={14} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-zinc-600 dark:text-zinc-400"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              className="text-zinc-900 dark:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="md:hidden overflow-hidden border-t border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex flex-col p-6 gap-4">
                {["Features", "How it Works", "Pricing", "Docs"].map((item) => (
                  <Link
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                    className="text-base font-medium text-zinc-600 dark:text-zinc-300 hover:text-orange-500 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
                <hr className="border-zinc-200 dark:border-zinc-800" />
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      router.push("/login");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 rounded-xl font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      navigateToDashboard();
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-orange-500 text-white w-full py-3 rounded-xl font-bold"
                  >
                    Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
