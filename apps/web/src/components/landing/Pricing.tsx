"use client";

import React from "react";
import { Check } from "lucide-react";
import Reveal from "../Reveal";

const Pricing = () => {
  return (
    <section
      id="pricing"
      className="py-24 border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Reveal variant="fade">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Start for free, scale as you grow.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <Reveal delay={100} className="h-full">
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col h-full hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                Starter
              </h3>
              <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
                $0<span className="text-zinc-500 text-sm font-normal">/mo</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8">
                Perfect for experimenting and small personal projects.
              </p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <Check size={16} className="text-zinc-400" /> 1,000 credits/mo
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <Check size={16} className="text-zinc-400" /> Basic templates
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <Check size={16} className="text-zinc-400" /> CSV Export
                </li>
              </ul>

              <button className="w-full py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium shadow-sm">
                Get Started
              </button>
            </div>
          </Reveal>

          {/* Pro Tier - Highlighted */}
          <Reveal delay={200} className="h-full">
            <div className="bg-white dark:bg-zinc-950 border border-orange-200 dark:border-orange-900 rounded-2xl p-8 flex flex-col relative shadow-xl shadow-orange-100 dark:shadow-none h-full ring-1 ring-orange-50 dark:ring-orange-900/50">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider shadow-lg">
                Most Popular
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                Professional
              </h3>
              <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
                $49
                <span className="text-zinc-500 text-sm font-normal">/mo</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8">
                For serious data extraction and automation workflows.
              </p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-zinc-900 dark:text-white">
                  <Check
                    size={16}
                    className="text-orange-600 dark:text-orange-400"
                  />{" "}
                  50,000 credits/mo
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-900 dark:text-white">
                  <Check
                    size={16}
                    className="text-orange-600 dark:text-orange-400"
                  />{" "}
                  Advanced Captcha Solving
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-900 dark:text-white">
                  <Check
                    size={16}
                    className="text-orange-600 dark:text-orange-400"
                  />{" "}
                  Priority Support
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-900 dark:text-white">
                  <Check
                    size={16}
                    className="text-orange-600 dark:text-orange-400"
                  />{" "}
                  API Access
                </li>
              </ul>

              <button className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-lg shadow-orange-500/20">
                Get Pro
              </button>
            </div>
          </Reveal>

          {/* Team Tier */}
          <Reveal delay={300} className="h-full">
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col h-full hover:border-orange-200 dark:hover:border-orange-900 transition-colors">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                Team
              </h3>
              <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
                $199
                <span className="text-zinc-500 text-sm font-normal">/mo</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8">
                Dedicated resources for large scale operations.
              </p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <Check size={16} className="text-zinc-400" /> Unlimited
                  credits
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <Check size={16} className="text-zinc-400" /> Dedicated IP
                  Pool
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <Check size={16} className="text-zinc-400" /> Custom
                  Integrations
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <Check size={16} className="text-zinc-400" /> SSO & Audit Logs
                </li>
              </ul>

              <button className="w-full py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium shadow-sm">
                Contact Sales
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
