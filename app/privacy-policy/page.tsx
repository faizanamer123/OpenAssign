'use client'

import React from "react";
import Logo from "@/components/ui/Logo";
import { FaDatabase, FaCogs, FaHandshake, FaShieldAlt, FaCrown, FaCookieBite, FaArchive, FaSync } from "react-icons/fa";

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "Information We Collect",
      icon: FaDatabase,
      items: [
        "Account information such as your email address, username, and profile details.",
        "Assignment and solution data you upload, create, or interact with on our platform.",
        "Usage data including pages visited, features used, and time spent on the platform.",
        "Device information such as IP address, browser type, and operating system.",
        "Communication data when you contact our support team or participate in surveys.",
        "Academic performance metrics to help improve our personalized recommendations."
      ]
    },
    {
      title: "How We Use Your Information",
      icon: FaCogs,
      items: [
        "To provide and maintain the platform's core features and functionality.",
        "To personalize your learning experience and provide relevant content recommendations.",
        "To communicate important updates, notifications, and educational content.",
        "To enhance security, prevent fraud, and protect against misuse of our services.",
        "To analyze usage patterns and improve our platform's performance and user experience.",
        "To provide customer support and respond to your inquiries promptly."
      ]
    },
    {
      title: "Data Sharing & Third Parties",
      icon: FaHandshake,
      items: [
        "We do not sell, trade, or rent your personal information to third parties.",
        "We may share anonymized, aggregated data for research and analytics purposes.",
        "We work with trusted service providers who help us operate our platform securely.",
        "We may disclose information when required by law or to protect our users' safety.",
        "Educational institutions may access student data only with proper authorization.",
        "All third-party partners are bound by strict confidentiality agreements."
      ]
    },
    {
      title: "Data Security & Protection",
      icon: FaShieldAlt,
      items: [
        "All data is encrypted in transit and at rest using industry-standard protocols.",
        "We implement multi-factor authentication and advanced access controls.",
        "Regular security audits and penetration testing ensure our systems remain secure.",
        "We maintain backup systems to prevent data loss and ensure service continuity.",
        "Our security team monitors for threats and responds to incidents 24/7.",
        "We comply with international data protection standards and regulations."
      ]
    },
    {
      title: "Your Rights & Control",
      icon: FaCrown,
      items: [
        "You have the right to access, update, or correct your personal information at any time.",
        "You may request a complete copy of all data we have about you.",
        "You can delete your account and request removal of your data permanently.",
        "You have control over communication preferences and notification settings.",
        "You can opt out of data collection for analytics and improvement purposes.",
        "You may file complaints with relevant data protection authorities if needed."
      ]
    },
    {
      title: "Cookies & Tracking",
      icon: FaCookieBite,
      items: [
        "We use essential cookies to ensure our platform functions properly.",
        "Analytics cookies help us understand how users interact with our services.",
        "You can manage cookie preferences through your browser settings.",
        "We do not use cookies for advertising or tracking across other websites.",
        "Session cookies are automatically deleted when you close your browser.",
        "We respect Do Not Track signals and similar privacy preferences."
      ]
    },
    {
      title: "Data Retention & Deletion",
      icon: FaArchive,
      items: [
        "We retain your data only as long as necessary to provide our services.",
        "Account data is kept for the duration of your active account status.",
        "Assignment data may be retained for educational and analytical purposes.",
        "Inactive accounts are automatically deleted after 2 years of inactivity.",
        "You can request immediate deletion of specific data categories.",
        "Some data may be retained for legal compliance even after account deletion."
      ]
    },
    {
      title: "Updates to This Policy",
      icon: FaSync,
      items: [
        "We may update this privacy policy to reflect changes in our practices or legal requirements.",
        "Significant changes will be communicated via email and prominent platform notifications.",
        "We will provide at least 30 days notice before implementing major policy changes.",
        "Continued use of our platform after changes constitutes acceptance of the updated policy.",
        "You may discontinue using our services if you disagree with policy updates.",
        "Previous versions of this policy remain available upon request for reference."
      ]
    }
  ];

  return (
    <div className="min-h-screen reddit-dark-bg px-4 py-8">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex justify-start mb-8">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <Logo 
              variant="default" 
              logoSize={48} 
              className="hover:no-underline focus:no-underline drop-shadow-lg" 
            />
          </div>
        </div>
        
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
            <span className="study-vibe-text">
              Privacy Policy
            </span>
          </h1>
          
          <div className="relative">
            <p className="text-gray-300 text-xl leading-relaxed font-medium max-w-3xl mx-auto">
              At <span className="font-bold text-[#4ade80]">AssignDump</span>, we are 
              committed to protecting your privacy and ensuring the security of your 
              personal information. This Privacy Policy explains how we collect, use, 
              and safeguard your data when you use our platform.
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#4ade80] to-transparent rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        <div className="grid gap-8 md:gap-10">
          {sections.map((section, index) => (
            <div 
              key={index}
              className="group study-card shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 w-16 h-16 soft-icon flex items-center justify-center mr-6">
                    <section.icon className="text-2xl text-[#4ade80]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#4ade80] transition-colors duration-300">
                      {index + 1}. {section.title}
                    </h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-[#4ade80] to-[#4ade80]/50 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div 
                      key={itemIndex}
                      className="flex items-start space-x-4 group/item hover:bg-[#4ade80]/5 p-3 rounded-xl transition-colors duration-200"
                    >
                      <div className="flex-shrink-0 w-2 h-2 bg-[#4ade80] rounded-full mt-3 group-hover/item:scale-125 transition-transform duration-200"></div>
                      <p className="text-gray-300 leading-relaxed text-lg font-medium group-hover/item:text-white transition-colors duration-200">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Decorative bottom border */}
              <div className="h-1 bg-gradient-to-r from-transparent via-[#4ade80]/20 to-transparent"></div>
            </div>
          ))}
        </div>

        {/* Privacy Commitment Section */}
        <div className="mt-16">
          <div className="bg-gradient-to-br from-[#4ade80]/10 via-[#4ade80]/5 to-[#4ade80]/10 rounded-3xl p-10 border border-[#4ade80]/20 text-center backdrop-blur-sm">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 soft-icon mb-4">
                <FaShieldAlt className="text-3xl text-[#4ade80]" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-6">
              Our Privacy Commitment
            </h3>
            <p className="text-gray-300 text-lg max-w-4xl mx-auto leading-relaxed mb-8">
              Your privacy is not just a policy for us—it's a fundamental right. We believe in 
              transparency, user control, and building trust through our actions, not just words. 
              Every decision we make prioritizes your data security and privacy above all else.
            </p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bubbly-card p-6">
                <div className="text-3xl font-bold text-[#4ade80] mb-2">0-ID</div>
                <div className="text-sm text-gray-300">Anonymity</div>
              </div>
              <div className="bubbly-card p-6">
                <div className="text-3xl font-bold text-[#4ade80] mb-2">24/7</div>
                <div className="text-sm text-gray-300">Security Monitoring</div>
              </div>
              <div className="bubbly-card p-6">
                <div className="text-3xl font-bold text-[#4ade80] mb-2">100%</div>
                <div className="text-sm text-gray-300">User Control</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}