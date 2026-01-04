"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  CircleDot,
  CheckCircle2,
  Loader2,
  HelpCircle,
  Shield,
  Trophy,
  Upload,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! 👋 I'm the AssignDump assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions = [
    { text: "How to upload?", icon: Upload },
    { text: "Earn points?", icon: Trophy },
    { text: "Review solutions?", icon: Star },
    { text: "Privacy & safety?", icon: Shield },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Simple if-else based chatbot logic
  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();

    // Upload assignments
    if (
      message.includes("upload") ||
      message.includes("how to upload") ||
      message.includes("upload assignment") ||
      message.includes("post assignment")
    ) {
      return "To upload an assignment, click the 'Upload' button in the header or go to the Upload page. You can upload files anonymously, add a title and description, and set a deadline. Your assignment will be visible to the community, and you'll receive notifications when someone submits a solution!";
    }

    // Anonymity
    if (
      message.includes("anonymous") ||
      message.includes("privacy") ||
      message.includes("identity") ||
      message.includes("name") ||
      message.includes("who can see")
    ) {
      return "Your identity is completely protected on AssignDump! All users have unique anonymous usernames, and no personal information is shared. You can upload assignments, submit solutions, and review work without revealing who you are. Your email is only used for account verification and notifications.";
    }

    // Points and badges
    if (
      message.includes("point") ||
      message.includes("badge") ||
      message.includes("earn") ||
      message.includes("reward") ||
      message.includes("reputation") ||
      message.includes("score")
    ) {
      return "You earn points by solving assignments and getting positive ratings on your solutions! Each solution you submit earns you points, and higher ratings give you bonus points. You can also earn badges for milestones like solving 10 assignments, reaching top 100 on the leaderboard, or getting 5-star ratings. Check your profile to see your progress!";
    }

    // Review solutions
    if (
      message.includes("review") ||
      message.includes("rate") ||
      message.includes("rating") ||
      message.includes("feedback") ||
      message.includes("how to review")
    ) {
      return "To review a solution, go to any assignment page and scroll to the submissions section. Click on a solution to view it, then use the star rating system (1-5 stars) to rate it. You can also leave comments to provide constructive feedback. Your reviews help maintain quality and help other students find the best solutions!";
    }

    // Safety and quality
    if (
      message.includes("safe") ||
      message.includes("security") ||
      message.includes("quality") ||
      message.includes("trust") ||
      message.includes("reliable") ||
      message.includes("moderation")
    ) {
      return "AssignDump is designed with your safety in mind! All content is community-moderated through our rating system. Low-rated solutions are flagged, and we have reporting mechanisms in place. Your personal information is never shared, and all interactions are anonymous. We also have community guidelines to ensure a positive learning environment for everyone.";
    }

    // Troubleshooting - upload issues
    if (
      message.includes("can't upload") ||
      message.includes("upload not working") ||
      message.includes("file error") ||
      message.includes("upload failed")
    ) {
      return "If you're having trouble uploading, make sure your file is under 10MB and in a supported format (PDF, DOC, DOCX, images). Check your internet connection and try refreshing the page. If the problem persists, try logging out and back in, or clear your browser cache.";
    }

    // Troubleshooting - login issues
    if (
      message.includes("can't login") ||
      message.includes("login problem") ||
      message.includes("sign in") ||
      message.includes("forgot password") ||
      message.includes("otp")
    ) {
      return "To sign in, enter your email address and you'll receive a 6-digit OTP code via email. Enter the code to verify and access your account. If you don't receive the OTP, check your spam folder and wait a minute before requesting a new one. Make sure you're using the same email you registered with.";
    }

    // Leaderboard
    if (
      message.includes("leaderboard") ||
      message.includes("rank") ||
      message.includes("ranking") ||
      message.includes("top") ||
      message.includes("position")
    ) {
      return "The leaderboard shows the top contributors ranked by points! You can view it by clicking 'Leaderboard' in the navigation. Your rank updates in real-time as you earn points from solving assignments and receiving ratings. Climb the ranks by consistently helping others with quality solutions!";
    }

    // Browse/search
    if (
      message.includes("browse") ||
      message.includes("search") ||
      message.includes("find assignment") ||
      message.includes("look for")
    ) {
      return "To browse assignments, click 'Browse' in the navigation bar. You can search by keywords, filter by subject or difficulty, and sort by newest, most popular, or deadline. This helps you find assignments you can help with or assignments similar to yours!";
    }

    // General help
    if (
      message.includes("help") ||
      message.includes("how does") ||
      message.includes("what is") ||
      message.includes("how do i") ||
      message.includes("guide")
    ) {
      return "AssignDump is an anonymous student community where you can upload assignments for help, solve others' assignments to earn points, review solutions, and compete on the leaderboard. Start by uploading an assignment or browsing existing ones to solve. Everything is anonymous and secure!";
    }

    // Greetings
    if (
      message.includes("hi") ||
      message.includes("hello") ||
      message.includes("hey") ||
      message.includes("greetings")
    ) {
      return "Hello! 👋 I'm here to help you with AssignDump. You can ask me about uploading assignments, earning points, reviewing solutions, anonymity, safety, or troubleshooting. What would you like to know?";
    }

    // Thank you
    if (
      message.includes("thank") ||
      message.includes("thanks") ||
      message.includes("appreciate")
    ) {
      return "You're welcome! 😊 Happy to help. If you have any other questions, just ask!";
    }

    // Fallback message
    return "I'm not sure I understand that question. Could you rephrase it? I can help with uploading assignments, anonymity, points and badges, reviewing solutions, safety, troubleshooting, or general questions about AssignDump. Try asking something like 'How do I upload an assignment?' or 'How does anonymity work?'";
  };

  const handleSendMessage = (customMessage?: string) => {
    const messageToSend = customMessage || inputValue;
    if (!messageToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageToSend,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot thinking delay
    setTimeout(() => {
      setIsTyping(false);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(messageToSend),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 800);
  };

  const handleQuickAction = (actionText: string) => {
    handleSendMessage(actionText);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] w-16 h-16 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#22c55e] via-[#16a34a] to-[#15803d] shadow-2xl shadow-[#22c55e]/30 hover:shadow-[#22c55e]/40 transition-all duration-300 flex items-center justify-center group hover:scale-110 active:scale-95 ${
          isOpen ? "scale-95 rotate-180" : "rotate-0"
        }`}
        aria-label="Open chatbot"
      >
        <div className="relative">
          {isOpen ? (
            <X className="w-7 h-7 sm:w-6 sm:h-6 text-white transition-all duration-300" />
          ) : (
            <>
              <MessageSquare className="w-7 h-7 sm:w-6 sm:h-6 text-white transition-transform group-hover:scale-110" />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-[#9333ea] animate-pulse" />
            </>
          )}
        </div>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-4 sm:h-4 bg-gradient-to-br from-[#9333ea] to-[#7c3aed] rounded-full border-2 border-[#1a1a1b] animate-pulse shadow-lg shadow-[#9333ea]/50"></span>
        )}
        {/* Ripple effect */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#22c55e]/15 animate-ping"></span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed top-4 bottom-20 left-4 right-4 sm:inset-auto sm:bottom-24 sm:right-6 sm:top-auto sm:left-auto z-[9999] w-auto sm:w-96 sm:max-w-md h-auto sm:h-[600px] sm:max-h-[700px] flex flex-col bg-[#1a1a1b]/98 backdrop-blur-xl border-[#22c55e]/25 shadow-2xl study-card animate-slide-up rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#22c55e]/15 bg-gradient-to-r from-[#22c55e]/8 via-[#9333ea]/8 to-[#06b6d4]/8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent animate-shimmer"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#22c55e] via-[#16a34a] to-[#15803d] flex items-center justify-center shadow-lg shadow-[#22c55e]/20">
                  <Bot className="w-6 h-6 sm:w-5 sm:h-5 text-white" />
                </div>
                <CircleDot className="absolute -bottom-0.5 -right-0.5 w-4 h-4 text-[#22c55e] bg-[#1a1a1b] rounded-full animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-base sm:text-lg">AssignDump Assistant</h3>
                  <Badge className="bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/25 text-[10px] px-1.5 py-0.5">
                    AI
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-400 font-medium">Online • Ready to help</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white hover:bg-[#22c55e]/10 rounded-full transition-all relative z-10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0">
            {messages.length === 1 && (
              <div className="space-y-3 mb-4">
                <p className="text-xs text-gray-500 font-medium px-1">Quick actions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action.text)}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-[#272729] hover:bg-[#272729]/80 border border-[#22c55e]/15 hover:border-[#22c55e]/30 text-gray-300 hover:text-white transition-all group text-xs sm:text-sm"
                    >
                      <action.icon className="w-4 h-4 text-[#22c55e] group-hover:scale-110 transition-transform" />
                      <span className="truncate">{action.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-slide-up ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "bot" && (
                  <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#22c55e] via-[#16a34a] to-[#15803d] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#22c55e]/15">
                    <Bot className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-lg ${
                    message.sender === "user"
                      ? "bg-gradient-to-br from-[#22c55e] via-[#16a34a] to-[#15803d] text-white rounded-br-md"
                      : "bg-[#272729] text-gray-200 border border-[#22c55e]/15 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <div className={`flex items-center gap-1 mt-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <span className="text-[10px] opacity-60">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {message.sender === "bot" && (
                      <CheckCircle2 className="w-3 h-3 text-[#22c55e] opacity-60" />
                    )}
                  </div>
                </div>
                {message.sender === "user" && (
                  <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#9333ea] via-[#7c3aed] to-[#6d28d9] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#9333ea]/20">
                    <User className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start animate-slide-up">
                <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#22c55e] via-[#16a34a] to-[#15803d] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#22c55e]/15">
                  <Bot className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="bg-[#272729] border border-[#22c55e]/15 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 sm:p-5 border-t border-[#22c55e]/15 bg-gradient-to-b from-[#1a1a1b] to-[#1a1a1b]/95 backdrop-blur-sm">
            <div className="flex gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full bg-[#272729] border-[#22c55e]/20 text-white placeholder:text-gray-500 focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/15 rounded-xl pr-12 h-11 sm:h-12 transition-all"
                />
                <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 hover:text-[#22c55e] cursor-help" />
              </div>
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-br from-[#22c55e] via-[#16a34a] to-[#15803d] hover:from-[#16a34a] hover:via-[#15803d] hover:to-[#166534] text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl h-11 sm:h-12 w-11 sm:w-12 p-0 shadow-lg shadow-[#22c55e]/15 hover:shadow-[#22c55e]/25 transition-all hover:scale-105 active:scale-95"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#22c55e]" />
                <span>Ask about uploads, points, reviews, or troubleshooting</span>
              </p>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}

