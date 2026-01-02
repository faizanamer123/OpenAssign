"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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

  return (
    <Link
      href={getHref()}
      className={`flex items-center text-white group transition-all duration-200 hover:scale-105 ${className}`}
      aria-label="AssignDump Home"
    >
      <div className="relative flex-shrink-0">
        <Image
          src="/OpenAssign.svg"
          alt="AssignDump Logo"
          width={logoSize}
          height={logoSize}
          className="block drop-shadow-sm group-hover:drop-shadow-md transition-all duration-200"
          priority
        />
      </div>
      {showText && (
        <span
          className={`-ml-1 font-bold study-vibe-text ${getTextSize()} ${textClassName}`}
        >
          AssignDump
        </span>
      )}
    </Link>
  );
}
