"use client";

import React from "react";
import { ArrowLeft, Github, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const onNavigate = (path: string) => {
    if (path === "home") router.push("/");
    if (path === "dashboard") router.push("/dashboard");
    if (path === "login") router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-background transition-colors">
      {/* Left Partition - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/30 to-amber-500/30" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="relative z-10 p-16 flex flex-col h-full justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 5000 4530"
                className="w-full h-full"
              >
                <g className="fill-white">
                  <path d="M2127 4125 c-273 -44 -527 -150 -738 -306 -61 -45 -69 -55 -92 -117 -37 -100 -75 -280 -88 -420 -44 -468 167 -949 523 -1185 83 -56 202 -117 226 -117 7 0 -13 33 -43 73 -67 87 -137 225 -165 327 -28 97 -38 290 -20 397 75 469 501 880 1021 987 222 46 477 46 668 1 22 -6 23 -4 11 10 -25 30 -215 151 -310 197 -123 60 -238 100 -386 134 -105 24 -143 28 -319 30 -139 2 -227 -1 -288 -11z" />
                  <path d="M2796 2949 c4 -8 25 -36 46 -62 121 -154 198 -382 198 -586 0 -464 -334 -894 -831 -1069 -182 -64 -270 -77 -519 -76 -187 1 -240 5 -315 21 -93 21 -109 21 -83 0 315 -258 641 -387 1023 -404 343 -15 694 83 982 276 134 90 145 103 177 205 106 341 110 635 14 940 -96 306 -312 573 -578 714 -89 47 -126 61 -114 41z" />
                </g>
                <g fill="rgb(241,98,41)">
                  <path d="M2970 3634 c-189 -23 -328 -60 -469 -125 -245 -113 -479 -337 -583 -555 -21 -45 -38 -85 -38 -88 0 -3 35 23 79 58 285 230 617 275 970 131 127 -52 242 -129 360 -241 209 -200 325 -408 398 -714 34 -145 43 -396 19 -558 -9 -62 -20 -120 -23 -130 -13 -36 35 19 94 107 167 250 256 505 284 814 27 290 -43 638 -179 897 -39 74 -150 244 -181 277 -24 26 -166 73 -307 103 -96 20 -342 34 -424 24z" />
                  <path d="M1018 3456 c-147 -192 -257 -449 -306 -711 -26 -142 -23 -428 6 -574 51 -253 143 -469 280 -658 33 -45 57 -67 86 -79 322 -131 640 -155 963 -74 310 78 584 271 737 519 55 89 100 180 93 187 -1 2 -39 -24 -82 -56 -193 -145 -402 -210 -633 -197 -522 29 -966 445 -1091 1022 -41 188 -45 425 -11 615 6 34 10 63 8 65 -2 2 -24 -25 -50 -59z" />
                </g>
              </svg>
            </div>
            <span className="font-semibold text-lg">Scrapter</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Start building your data pipeline today.
            </h2>
            <ul className="space-y-4 text-zinc-300">
              <li className="flex items-center gap-3">
                <Check className="text-primary-500" size={20} /> 1,000 free API
                credits
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-primary-500" size={20} /> Access to all
                templates
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-primary-500" size={20} /> No credit card
                required
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Partition - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-background">
        <div className="max-w-sm w-full space-y-8 animate-enter-load">
          <button
            onClick={() => onNavigate("home")}
            className="group flex items-center text-sm text-zinc-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-8"
          >
            <ArrowLeft
              size={16}
              className="mr-2 group-hover:-translate-x-1 transition-transform"
            />
            Back to website
          </button>

          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Get started with Scrapter in seconds
            </p>
          </div>

          <form
            className="mt-8 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              onNavigate("dashboard");
            }}
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-card/50 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-500 sm:text-sm transition-shadow"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-card/50 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-500 sm:text-sm transition-shadow"
                  placeholder="name@company.com"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-card/50 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-500 sm:text-sm transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all transform hover:scale-[1.01]"
            >
              Create Account
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-background px-2 text-zinc-500 dark:text-zinc-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-card hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-colors"
              >
                <Github size={18} />
                GitHub
              </button>
              <button
                type="button"
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-card hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-colors"
              >
                <svg
                  viewBox="0 0 262 262"
                  className="w-[18px] h-[18px]"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                    fill="#4285F4"
                  />
                  <path
                    d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                    fill="#34A853"
                  />
                  <path
                    d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                    fill="#FBBC05"
                  />
                  <path
                    d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                    fill="#EB4335"
                  />
                </svg>
                Google
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
            <button
              onClick={() => onNavigate("login")}
              className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline underline-offset-4"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
