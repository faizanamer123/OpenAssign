"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface LogoProps {
  className?: string;
  textClassName?: string;
  logoSize?: number;
  href?: string;
  showText?: boolean;
  variant?: "default" | "compact" | "large";
}

export default function Logo({
  className = "",
  textClassName = "",
  logoSize = 44,
  href,
  showText = true,
  variant = "default",
}: LogoProps) {
  const { user } = useAuth();

  // Always redirect to landing page (/) regardless of auth state
  const getHref = () => {
    if (href) return href; // If href is explicitly provided, use it
    return "/"; // Always go to landing page
  };

  const getTextSize = () => {
    switch (variant) {
      case "compact":
        return "text-base";
      case "large":
        return "text-xl sm:text-2xl";
      default:
        return "text-lg sm:text-xl";
    }
  };

  const iconSize =
    variant === "large"
      ? "text-3xl"
      : variant === "compact"
      ? "text-xl"
      : "text-2xl";

  const containerSize =
    variant === "large"
      ? "size-12"
      : variant === "compact"
      ? "size-8"
      : "size-10";

  return (
    <Link
      href={getHref()}
      className={`flex items-center gap-3 ${className}`}
    >
      {/* Glassmorphic UI Logo */}
      <div
        className={`${containerSize} flex items-center justify-center rounded-lg backdrop-blur-lg bg-white/10 border border-white/20 relative group transition-all hover:bg-white/15`}
      >
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-[#13ec92]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
        
        {/* Diamond icon */}
        <span
          className={`material-symbols-outlined text-[#13ec92] ${iconSize} relative z-10`}
          style={{ fontVariationSettings: '"FILL" 1, "wght" 400' }}
        >
          diamond
        </span>
      </div>

      {showText && (
        <span
          className={`font-bold tracking-tight ${getTextSize()} ${textClassName}`}
        >
          Assign<span className="text-[#80e1e1]">Dump</span>
        </span>
      )}
    </Link>
  );
}