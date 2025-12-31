"use client";

import React from "react";
import { Terminal, Github, Twitter, Linkedin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-bg-panel border-t border-bg-border pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-black">
                <Terminal size={18} strokeWidth={3} />
              </div>
              <span className="font-bold text-xl text-zinc-900 dark:text-white">
                Scrapter
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-500 text-sm leading-relaxed mb-6">
              The first autonomous browser agent that truly understands the web.
              Built for developers, by developers.
            </p>
            <div className="flex gap-4">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-zinc-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-zinc-900 dark:text-white mb-6">
              Product
            </h4>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-500">
              <li>
                <a
                  href="#"
                  className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                >
                  Integrations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                >
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-zinc-900 dark:text-white mb-6">
              Resources
            </h4>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-500">
              <li>
                <a
                  href="#"
                  className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-zinc-900 dark:text-white mb-6">
              Legal
            </h4>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-500">
              <li>
                <a
                  href="#"
                  className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-bg-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600 dark:text-zinc-600">
          <p>
            © {new Date().getFullYear()} Scrapter AI Inc. All rights reserved.
          </p>
          <div className="flex gap-2 items-center">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            System Status: Operational
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
