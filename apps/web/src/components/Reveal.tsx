"use client";

import React, { useRef } from "react";
import { useInView } from "@/hooks/useInView";
import { cn } from "@extension/ui"; // Or your utility class merger

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  width?: "full" | "auto";
  // 'fade' = opacity only (like old FadeIn)
  // 'slide' = opacity + translateY (like old Reveal)
  variant?: "fade" | "slide" | "blur";
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
  width = "auto",
  variant = "slide",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, 0.1, true);

  const getHiddenState = () => {
    switch (variant) {
      case "fade":
        return "opacity-0";
      case "blur":
        return "opacity-0 blur-sm scale-95";
      case "slide":
      default:
        return "opacity-0 translate-y-8";
    }
  };

  const getVisibleState = () => {
    switch (variant) {
      case "fade":
        return "opacity-100";
      case "blur":
        return "opacity-100 blur-0 scale-100";
      case "slide":
      default:
        return "opacity-100 translate-y-0";
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative",
        width === "full" ? "w-full" : "inline-block",
        className,
      )}
    >
      <div
        style={{
          transitionDuration: `${duration}s`,
          transitionDelay: `${delay}ms`,
          transitionProperty: "all",
          transitionTimingFunction: "cubic-bezier(0.17, 0.55, 0.55, 1)",
        }}
        className={isInView ? getVisibleState() : getHiddenState()}
      >
        {children}
      </div>
    </div>
  );
};

export default Reveal;
