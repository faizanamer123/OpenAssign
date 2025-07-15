'use client'

import React from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Terms() {
  const { user } = useAuth();
  const router = useRouter();
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push("/home");
    } else {
      router.push("/");
    }
  };
  return (
    <div className="min-h-screen bg-[#fcfbf8] px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <a href="#" onClick={handleLogoClick} className="flex items-center gap-3 text-[#1c180d] group" aria-label="OpenAssign Home">
          <div className="relative">
            <div className="size-8 bg-gradient-to-br from-[#fac638] to-[#e6b332] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Star className="w-5 h-5 text-[#1c180d]" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#fac638] rounded-full pulse-glow"></div>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#1c180d] to-[#9e8747] bg-clip-text text-transparent">
            OpenAssign
          </h1>
        </a>
      </div>
      <h1 className="text-3xl font-extrabold text-[#1c180d] mb-8 text-center tracking-tight drop-shadow-sm">Terms & Conditions</h1>
      <p className="text-[#1c180d] mb-8 text-lg text-center font-medium max-w-2xl mx-auto">Welcome to OpenAssign. By accessing or using our platform, you agree to comply with the following terms and conditions. Please read them carefully to understand your rights and responsibilities as a user.</p>
      <div className="bg-white/90 rounded-2xl shadow-md border border-[#e9e2ce] max-w-3xl mx-auto p-8 space-y-8">
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#1c180d] mb-2">1. User Conduct</h2>
          <ul className="list-disc pl-6 text-[#9e8747]">
            <li>All content must comply with academic integrity and ethical standards.</li>
            <li>Do not share, upload, or request inappropriate or illegal content.</li>
            <li>Respect the privacy and rights of other users at all times.</li>
          </ul>
        </section>
        <hr className="border-[#e9e2ce]" />
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#1c180d] mb-2">2. Platform Usage</h2>
          <ul className="list-disc pl-6 text-[#9e8747]">
            <li>Use the platform only for lawful and educational purposes.</li>
            <li>Do not attempt to disrupt or misuse the platform or its services.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
          </ul>
        </section>
        <hr className="border-[#e9e2ce]" />
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#1c180d] mb-2">3. Intellectual Property</h2>
          <ul className="list-disc pl-6 text-[#9e8747]">
            <li>All content and materials on OpenAssign are protected by copyright and intellectual property laws.</li>
            <li>Do not copy, distribute, or use content without proper authorization.</li>
          </ul>
        </section>
        <hr className="border-[#e9e2ce]" />
        <section>
          <h2 className="text-xl font-semibold text-[#1c180d] mb-2">4. Changes to Terms</h2>
          <p className="text-[#9e8747]">We may update these terms from time to time. Continued use of the platform constitutes acceptance of the revised terms.</p>
        </section>
      </div>
    </div>
  );
} 