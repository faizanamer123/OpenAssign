"use client";

import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trophy,
  Sparkles,
  Shield,
  Zap,
  BookOpen,
  Award,
  TrendingUp,
  LogIn,
} from "lucide-react";
import { sendOtpEmail } from "@/lib/sendOtpEmail";
import Logo from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen reddit-dark-bg overflow-hidden animate-fade-in">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#4ade80]/15 rounded-full blur-3xl floating-animation"></div>
        <div
          className="absolute top-40 right-20 w-96 h-96 bg-[#9333ea]/8 rounded-full blur-3xl floating-animation"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#06b6d4]/12 rounded-full blur-3xl floating-animation"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 lg:px-10 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Logo href="/" variant="large" logoSize={56} />
          <Link href="/register">
            <Button
              variant="outline"
              className="bg-transparent border-[#4ade80]/30 text-white hover:bg-[#4ade80]/10 hover:border-[#4ade80]/50 transition-all duration-300"
            >
              <LogIn className="w-4 h-4" />
              Register
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-[#4ade80]/20 border border-[#4ade80]/30 rounded-full px-4 py-2 mb-8 shadow-sm neon-border">
              <Sparkles className="w-4 h-4 text-[#4ade80] animate-bounce" />
              <span className="text-sm font-medium text-white">
                100% Anonymous • Secure • Rewarding
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-lg">
              <span className="block">Anonymous</span>
              <span className="block bg-gradient-to-r from-[#4ade80] to-[#9333ea] bg-clip-text text-transparent animate-gradient-x">
                Assignment Platform
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl leading-8 text-gray-300 max-w-3xl mx-auto">
              Upload assignments to get help or solve others' assignments to
              earn points and recognition. Join a thriving community of students
              helping each other succeed.
            </p>

            {/* Social Media Icons */}
            <div className="mt-12 w-4/5 mx-auto">
              <div className="flex items-center justify-between">
                {/* Reddit */}
                <a
                  href="https://reddit.com/r/openassign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group animate-scale-in hover:scale-110 transition-transform duration-300 flex-1 flex justify-center"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gray-700/50 rounded-full flex items-center justify-center group-hover:bg-gray-600/70 transition-colors">
                    {/* Reddit Icon */}
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-gray-300 group-hover:text-white transition-colors"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                    </svg>
                  </div>
                </a>

                {/* Divider */}
                <div className="w-1 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-transparent via-gray-500 to-transparent"></div>

                {/* Discord */}
                <a
                  href="https://discord.gg/uv3pj5DeDv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group animate-scale-in hover:scale-110 transition-transform duration-300 flex-1 flex justify-center"
                  style={{ animationDelay: "0.4s" }}
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gray-700/50 rounded-full flex items-center justify-center group-hover:bg-gray-600/70 transition-colors">
                    {/* Discord Icon */}
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-gray-300 group-hover:text-white transition-colors"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </div>
                </a>

                {/* Divider */}
                <div className="w-1 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-transparent via-gray-500 to-transparent"></div>

                {/* GitHub */}
                <a
                  href="https://github.com/faizanamer123/OpenAssign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group animate-scale-in hover:scale-110 transition-transform duration-300 flex-1 flex justify-center"
                  style={{ animationDelay: "0.6s" }}
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gray-700/50 rounded-full flex items-center justify-center group-hover:bg-gray-600/70 transition-colors">
                    {/* GitHub Icon */}
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-gray-300 group-hover:text-white transition-colors"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className="mt-8 mb-8">
              <div className="w-48 h-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent mx-auto"></div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 max-w-md mx-auto">
              <div
                className="text-center animate-scale-in flex-1"
                style={{ animationDelay: "0.8s" }}
              >
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow">
                  1,200+
                </div>
                <div className="text-base sm:text-lg text-gray-300">
                  Active Users
                </div>
              </div>

              {/* Divider */}
              <div className="w-1 h-16 sm:h-20 lg:h-24 bg-gradient-to-b from-transparent via-gray-500 to-transparent"></div>

              <div
                className="text-center animate-scale-in flex-1"
                style={{ animationDelay: "1.0s" }}
              >
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow">
                  4.9★
                </div>
                <div className="text-base sm:text-lg text-gray-300">
                  Platform Rating
                </div>
              </div>
            </div>
          </div>

          {/* Auth Card */}

          {/* Features Grid */}
          <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8 text-white" />,
                title: "100% Anonymous",
                color: "from-[#4ade80] to-[#22c55e]",
              },
              {
                icon: <Trophy className="h-8 w-8 text-white" />,
                title: "Earn Points & Recognition",
                color: "from-[#9333ea] to-[#7c3aed]",
              },
              {
                icon: <Zap className="h-8 w-8 text-white" />,
                title: "Instant Notifications",
                color: "from-[#06b6d4] to-[#0891b2]",
              },
              {
                icon: <BookOpen className="h-8 w-8 text-white" />,
                title: "All Subjects",
                color: "from-[#ec4899] to-[#db2777]",
              },
              {
                icon: <Award className="h-8 w-8 text-white" />,
                title: "Quality Solutions",
                color: "from-[#4ade80] to-[#22c55e]",
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-white" />,
                title: "Track Progress",
                color: "from-[#9333ea] to-[#7c3aed]",
              },
            ].map((feature, i) => (
              <Card
                key={feature.title}
                className={`study-card card-hover animate-slide-up shadow-md hover:shadow-xl transition-shadow duration-300 group`}
                style={{ animationDelay: `${0.2 + i * 0.2}s` }}
              >
                <CardContent className="px-8 py-8 text-center">
                  <div
                    className={`mx-auto w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.title === "100% Anonymous" &&
                      "Complete privacy with unique anonymous usernames. Your identity stays protected while you help others."}
                    {feature.title === "Earn Points & Recognition" &&
                      "Solve assignments to earn points, climb the leaderboard, and build your reputation in the community."}
                    {feature.title === "Instant Notifications" &&
                      "Get notified when your assignments are solved or when you receive ratings for your solutions."}
                    {feature.title === "All Subjects" &&
                      "From Mathematics to Computer Science, get help with assignments across all academic disciplines."}
                    {feature.title === "Quality Solutions" &&
                      "Rate and review solutions to ensure high-quality help. Build trust through our community-driven system."}
                    {feature.title === "Track Progress" &&
                      "Monitor your uploaded assignments and submitted solutions with detailed activity tracking."}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
