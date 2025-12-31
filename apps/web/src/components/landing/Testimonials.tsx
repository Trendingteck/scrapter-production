"use client";

import React from "react";
import { Star } from "lucide-react";
import Reveal from "../Reveal";

const testimonials = [
  {
    quote:
      "Scrapter cut our data acquisition time by 90%. The captcha solver is basically magic.",
    author: "Elena Rodriguez",
    role: "Data Lead @ FinTechCo",
    rating: 5,
  },
  {
    quote:
      "Finally, a scraping tool that doesn't break every time a website updates its CSS.",
    author: "Marcus Thompson",
    role: "CTO @ GrowthLabs",
    rating: 5,
  },
  {
    quote:
      "The ability to extract structured data from video content opened up a whole new revenue stream for us.",
    author: "Sarah Jenkins",
    role: "Founder @ MediaScout",
    rating: 5,
  },
  {
    quote:
      "We replaced our entire Python Selenium stack with Scrapter agents in one week.",
    author: "David Kim",
    role: "Lead Eng @ DataFlow",
    rating: 5,
  },
  {
    quote:
      "The visual extraction engine is incredibly precise. It sees the web exactly like a human does.",
    author: "Amanda Chen",
    role: "Product @ InsightAI",
    rating: 5,
  },
  {
    quote:
      "API reliability is unmatched. We run 100k concurrent requests without a hiccup.",
    author: "James Wilson",
    role: "DevOps @ ScaleUp",
    rating: 5,
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-orange-500/5 dark:bg-orange-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-screen-2xl mx-auto px-6 text-center mb-16 relative z-10">
        <Reveal variant="fade">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
            Trusted by data-driven teams
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
            Powering extraction pipelines for fast-moving startups and Fortune
            500s.
          </p>
        </Reveal>
      </div>

      {/* Marquee Container */}
      <div className="relative flex overflow-x-hidden group">
        {/* Gradient Masks */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-black to-transparent z-20 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-black to-transparent z-20 pointer-events-none"></div>

        <div className="flex w-max animate-scroll group-hover:[animation-play-state:paused] gap-6 px-3">
          {/* Duplicate items for infinite loop */}
          {[...testimonials, ...testimonials].map((t, i) => (
            <div
              key={i}
              className="w-[400px] p-8 bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-3xl hover:border-orange-500/30 dark:hover:border-orange-500/30 transition-colors shadow-sm shrink-0 flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-0.5 mb-5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-orange-400 text-orange-400"
                    />
                  ))}
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 text-base leading-relaxed font-medium mb-6">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-100 to-zinc-200 dark:from-orange-900/30 dark:to-zinc-800 flex items-center justify-center text-sm font-bold text-orange-700 dark:text-orange-500 border border-white dark:border-zinc-800 shadow-sm">
                  {t.author.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="text-zinc-900 dark:text-white text-sm font-bold">
                    {t.author}
                  </div>
                  <div className="text-zinc-400 dark:text-zinc-500 text-xs font-mono">
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
