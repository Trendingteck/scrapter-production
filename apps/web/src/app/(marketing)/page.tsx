"use client";

import React from "react";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import InteractiveDemo from "@/components/landing/InteractiveDemo";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";

export default function LandingPage() {
  return (
    <div className="bg-white dark:bg-black min-h-screen">
      <Hero />
      <Features />
      <InteractiveDemo />
      <Testimonials />
      <Pricing />
    </div>
  );
}
