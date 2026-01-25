"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface LogoProps {
  className?: string;
  textClassName?: string;
  logoSize?: number;
  href?: string;
  showText?: boolean;
  variant?: "default" | "compact" | "large";
  disableHover?: boolean;
}

export default function Logo({
  className = "",
  textClassName = "",
  logoSize = 44,
  href,
  showText = true,
  variant = "default",
  disableHover = false,
}: LogoProps) {
  const { user } = useAuth();
  const [iconLoaded, setIconLoaded] = useState(false);

  // Preload the Material Symbols font immediately
  useEffect(() => {
    // Create and inject font link if not already present
    if (!document.querySelector('link[href*="Material+Symbols+Outlined"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap';
      document.head.appendChild(link);
    }

    // Check if font is already loaded
    if (document.fonts && document.fonts.load) {
      document.fonts.load('400 24px "Material Symbols Outlined"')
        .then(() => {
          // Small delay to ensure font is fully rendered
          setTimeout(() => setIconLoaded(true), 50);
        })
        .catch(() => {
          // Fallback if font loading fails
          setIconLoaded(true);
        });
    } else {
      // Fallback for older browsers
      const timer = setTimeout(() => setIconLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

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
      className={`flex items-center gap-3 ${disableHover ? 'hover:!no-underline' : ''} ${className}`}
    >
      {/* Glassmorphic UI Logo */}
      <div
        className={`${containerSize} flex items-center justify-center rounded-lg backdrop-blur-lg bg-white/10 border border-white/20 relative ${disableHover ? '' : 'group transition-all hover:bg-white/15'} ${disableHover ? 'hover:!bg-white/10 hover:!border-white/20 hover:!transform-none' : ''}`}
      >
        {/* Hover glow effect - only show if hover is enabled */}
        {!disableHover && (
          <div className="absolute inset-0 bg-[#13ec92]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
        )}
        
        {/* Diamond icon - always show SVG fallback first, then Material Symbols when loaded */}
        <div className={`relative z-10 ${disableHover ? 'hover:!transform-none' : ''}`}>
          {!iconLoaded ? (
            // SVG Fallback - shows immediately
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className={`${iconSize} text-[#13ec92] ${disableHover ? 'hover:!text-[#13ec92]' : ''}`}
              style={{ 
                width: variant === "large" ? "1.5rem" : variant === "compact" ? "1.25rem" : "1.5rem",
                height: variant === "large" ? "1.5rem" : variant === "compact" ? "1.25rem" : "1.5rem"
              }}
            >
              <path d="M6 3h12l4 6-10 12L2 9z" fill="currentColor"/>
            </svg>
          ) : (
            // Material Symbols - shows after font loads
            <span
              className={`material-symbols-outlined text-[#13ec92] ${iconSize} ${disableHover ? 'hover:!text-[#13ec92]' : ''}`}
              style={{ 
                fontVariationSettings: '"FILL" 1, "wght" 400',
                display: 'block'
              }}
            >
              diamond
            </span>
          )}
        </div>
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