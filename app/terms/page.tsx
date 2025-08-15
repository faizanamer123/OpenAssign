'use client'

import React from "react";
import Logo from "@/components/ui/Logo";
import { FaUser, FaBullseye, FaBook, FaLock, FaBolt, FaEdit } from "react-icons/fa";

export default function Terms() {
  const sections = [
    {
      title: "User Conduct",
      icon: FaUser,
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
      icon: FaBullseye,
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
      icon: FaBook,
      items: [
        "All content and materials on OpenAssign are protected by copyright and intellectual property laws.",
        "Do not copy, distribute, or use content without proper authorization.",
        "Respect third-party intellectual property rights when sharing content.",
        "Original work submissions must be your own creation.",
        "Cite sources appropriately when referencing external materials."
      ]
    },
    {
      title: "Privacy & Data Protection",
      icon: FaLock,
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
      icon: FaBolt,
      items: [
        "We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service.",
        "Scheduled maintenance will be communicated in advance when possible.",
        "We are not liable for temporary service interruptions or technical issues.",
        "Alternative access methods may be provided during maintenance periods."
      ]
    },
    {
      title: "Changes to Terms",
      icon: FaEdit,
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
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted px-4 py-8">
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
          <h1 className="text-5xl font-black text-foreground mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent">
              Terms & Conditions
            </span>
          </h1>
          
          <div className="relative">
            <p className="text-foreground text-xl leading-relaxed font-medium max-w-3xl mx-auto">
              Welcome to <span className="font-bold text-primary">OpenAssign</span>. 
              By accessing or using our platform, you agree to comply with the following 
              terms and conditions. Please read them carefully to understand your rights 
              and responsibilities as a valued member of our community.
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
          </div>
        </div>
      </div>



      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        <div className="grid gap-8 md:gap-10">
          {sections.map((section, index) => (
            <div 
              key={index}
              className="group bg-card/95 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl border border-border hover:border-primary/30 transition-all duration-500 overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                    <section.icon className="text-2xl text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {index + 1}. {section.title}
                    </h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div 
                      key={itemIndex}
                      className="flex items-start space-x-4 group/item hover:bg-primary/5 p-3 rounded-xl transition-colors duration-200"
                    >
                      <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-3 group-hover/item:scale-125 transition-transform duration-200"></div>
                      <p className="text-muted-foreground leading-relaxed text-lg font-medium group-hover/item:text-foreground transition-colors duration-200">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Decorative bottom border */}
              <div className="h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
}