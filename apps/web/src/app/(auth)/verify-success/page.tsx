"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@extension/ui";
import confetti from "canvas-confetti";

export default function VerifySuccessPage() {
  const [glitters, setGlitters] = useState(false);

  useEffect(() => {
    // Fire confetti on load
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    setGlitters(true);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-black -z-10" />
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 relative">
        <div
          className={`transition-all duration-1000 transform ${glitters ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
        >
          <div className="mx-auto w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping"></div>
            <CheckCircle2 className="w-12 h-12 text-orange-500 relative z-10" />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
            Account Verified Successfully!
          </h1>

          <p className="text-xl text-zinc-400 max-w-lg mx-auto mb-10 leading-relaxed">
            Your email has been verified. You&apos;re now ready to harness the
            full power of Scrapter&apos;s AI agent.
          </p>

          <Link href="/dashboard">
            <Button
              size="lg"
              className="h-14 px-10 text-lg bg-orange-500 hover:bg-orange-600 text-black font-black shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.5)] transition-all group"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
