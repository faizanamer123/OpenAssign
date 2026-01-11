'use client'

import React from "react";
import Logo from "@/components/ui/Logo";

export default function Terms() {
  const sections = [
    {
      title: "User Conduct",
      icon: "person",
      items: [
        "All content must comply with academic integrity and ethical standards.",
        "Do not share, upload, or request inappropriate or illegal content.",
        "Respect the privacy and rights of other users at all times.",
        "Maintain professional communication in all interactions.",
        "Report any violations or concerns to our support team promptly."
      ]
    },
    {
      title: "Platform Usage",
      icon: "target",
      items: [
        "Use the platform only for lawful and educational purposes.",
        "Do not attempt to disrupt or misuse the platform or its services.",
        "We reserve the right to suspend or terminate accounts that violate these terms.",
        "Ensure your account information remains accurate and up-to-date.",
        "Do not create multiple accounts or share login credentials."
      ]
    },
    {
      title: "Intellectual Property",
      icon: "menu_book",
      items: [
        "All content and materials on AssignDump are protected by copyright and intellectual property laws.",
        "Do not copy, distribute, or use content without proper authorization.",
        "Respect third-party intellectual property rights when sharing content.",
        "Original work submissions must be your own creation.",
        "Cite sources appropriately when referencing external materials."
      ]
    },
    {
      title: "Privacy & Data Protection",
      icon: "lock",
      items: [
        "We are committed to protecting your personal information and privacy.",
        "Data collection and usage follows our comprehensive Privacy Policy.",
        "You have control over your personal data and can request its deletion.",
        "We implement industry-standard security measures to protect user data.",
        "Third-party integrations are carefully vetted for security compliance."
      ]
    },
    {
      title: "Service Availability",
      icon: "bolt",
      items: [
        "We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service.",
        "Scheduled maintenance will be communicated in advance when possible.",
        "We are not liable for temporary service interruptions or technical issues.",
        "Alternative access methods may be provided during maintenance periods."
      ]
    },
    {
      title: "Changes to Terms",
      icon: "edit",
      items: [
        "We may update these terms from time to time to reflect changes in our services.",
        "Significant changes will be communicated via email and platform notifications.",
        "Continued use of the platform constitutes acceptance of the revised terms.",
        "You may discontinue use if you disagree with updated terms.",
        "Previous versions of terms remain available upon request."
      ]
    }
  ];

  return (
    <div className="min-h-screen font-display text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-charcoal">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#13ec9c]/15 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#13ec9c]/8 rounded-full blur-3xl floating-animation" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header Section */}
        <div className="mb-12 sm:mb-16">
          <div className="flex justify-start mb-8 sm:mb-12">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <Logo 
                variant="default" 
                logoSize={48} 
              />
            </div>
          </div>
          
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
              Terms & <span className="text-[#13ec9c]">Conditions</span>
            </h1>
            
            <div className="relative">
              <p className="text-white/60 text-lg sm:text-xl leading-relaxed font-light max-w-3xl mx-auto">
                Welcome to <span className="font-bold text-[#13ec9c]">AssignDump</span>. 
                By accessing or using our platform, you agree to comply with the following 
                terms and conditions. Please read them carefully to understand your rights 
                and responsibilities as a valued member of our community.
              </p>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#13ec9c] to-transparent rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6 sm:gap-8 md:gap-10">
            {sections.map((section, index) => (
              <div 
                key={index}
                className="group glass-morphism hover-card rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 hover:border-[#13ec9c]/30 transition-all duration-500"
              >
                <div className="p-6 sm:p-8 md:p-10">
                  <div className="flex items-center mb-6">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 glass-morphism rounded-xl flex items-center justify-center mr-4 sm:mr-6 border border-[#13ec9c]/20">
                      <span className="material-symbols-outlined text-[#13ec9c] text-xl sm:text-2xl" style={{ fontVariationSettings: '"FILL" 1, "wght" 400' }}>
                        {section.icon}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-[#13ec9c] transition-colors duration-300">
                        {index + 1}. {section.title}
                      </h2>
                      <div className="w-12 h-1 bg-gradient-to-r from-[#13ec9c] to-[#13ec9c]/50 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <div 
                        key={itemIndex}
                        className="flex items-start space-x-3 sm:space-x-4 group/item hover:bg-[#13ec9c]/5 p-3 sm:p-4 rounded-xl transition-colors duration-200"
                      >
                        <div className="flex-shrink-0 w-2 h-2 bg-[#13ec9c] rounded-full mt-2 sm:mt-3 group-hover/item:scale-125 transition-transform duration-200"></div>
                        <p className="text-white/70 leading-relaxed text-sm sm:text-base lg:text-lg font-medium group-hover/item:text-white transition-colors duration-200">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Decorative bottom border */}
                <div className="h-1 bg-gradient-to-r from-transparent via-[#13ec9c]/20 to-transparent"></div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-12 sm:mt-16">
            <div className="glass-morphism rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 border border-[#13ec9c]/20 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 glass-morphism rounded-xl mb-4 border border-[#13ec9c]/20">
                  <span className="material-symbols-outlined text-[#13ec9c] text-3xl sm:text-4xl" style={{ fontVariationSettings: '"FILL" 1, "wght" 400' }}>
                    verified
                  </span>
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
                Questions About Our Terms?
              </h3>
              <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8">
                If you have any questions or concerns about these terms and conditions, 
                please don't hesitate to reach out to our support team. We're here to help.
              </p>
              <a 
                href="/register"
                className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-[#13ec9c] text-charcoal font-bold rounded-xl sm:rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-[#13ec9c]/30"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}