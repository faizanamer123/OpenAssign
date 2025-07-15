import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";

interface LogoProps {
  className?: string;
  textClassName?: string;
  iconSize?: number;
  dotSize?: number;
  href?: string;
}

export default function Logo({
  className = "",
  textClassName = "",
  iconSize = 8,
  dotSize = 3,
  href = "/home",
}: LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-3 text-[#1c180d] group ${className}`} aria-label="OpenAssign Home">
      <div className="relative">
        <div className={`size-${iconSize} bg-gradient-to-br from-[#fac638] to-[#e6b332] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Star className="w-5 h-5 text-[#1c180d]" />
        </div>
        <div className={`absolute -top-1 -right-1 w-${dotSize} h-${dotSize} bg-[#fac638] rounded-full pulse-glow`}></div>
      </div>
      <span className={`text-xl font-bold bg-gradient-to-r from-[#1c180d] to-[#9e8747] bg-clip-text text-transparent ${textClassName}`}>
        OpenAssign
      </span>
    </Link>
  );
} 