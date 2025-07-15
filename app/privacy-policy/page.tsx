'use client'

import React from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function PrivacyPolicy() {
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
      <h1 className="text-3xl font-extrabold text-[#1c180d] mb-8 text-center tracking-tight drop-shadow-sm">Privacy Policy</h1>
      <p className="text-[#1c180d] mb-8 text-lg text-center font-medium max-w-2xl mx-auto">At OpenAssign, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.</p>
      <div className="bg-white/90 rounded-2xl shadow-md border border-[#e9e2ce] max-w-3xl mx-auto p-8 space-y-8">
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#1c180d] mb-2">1. Information We Collect</h2>
          <ul className="list-disc pl-6 text-[#9e8747]">
            <li>Account information such as your email address and username.</li>
            <li>Assignment and solution data you upload or interact with.</li>
            <li>Usage data to improve our services and user experience.</li>
          </ul>
        </section>
        <hr className="border-[#e9e2ce]" />
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#1c180d] mb-2">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-[#9e8747]">
            <li>To provide and maintain the platform's core features.</li>
            <li>To communicate important updates and notifications.</li>
            <li>To enhance security and prevent misuse.</li>
          </ul>
        </section>
        <hr className="border-[#e9e2ce]" />
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#1c180d] mb-2">3. Data Sharing & Security</h2>
          <ul className="list-disc pl-6 text-[#9e8747]">
            <li>We do <span className="font-bold">not</span> share your personal information with third parties.</li>
            <li>All data is stored securely using industry best practices.</li>
            <li>You may request deletion of your account and data at any time.</li>
          </ul>
        </section>
        <hr className="border-[#e9e2ce]" />
        <section>
          <h2 className="text-xl font-semibold text-[#1c180d] mb-2">4. Contact Us</h2>
          <p className="text-[#9e8747]">If you have any questions or concerns about our privacy practices, please contact our support team.</p>
        </section>
      </div>
    </div>
  );
} 