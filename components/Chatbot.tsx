"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircleMore,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Shield,
  Trophy,
  Upload,
  Star,
  CheckCircle2,
} from "lucide-react";

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
  const chatbotRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();

    if (
      message.includes("upload") ||
      message.includes("how to upload") ||
      message.includes("upload assignment") ||
      message.includes("post assignment")
    ) {
      return "To upload an assignment, click the 'Upload' button in the header or go to the Upload page. You can upload files anonymously, add a title and description, and set a deadline. Your assignment will be visible to the community, and you'll receive notifications when someone submits a solution!";
    }

    if (
      message.includes("anonymous") ||
      message.includes("privacy") ||
      message.includes("identity") ||
      message.includes("name") ||
      message.includes("who can see")
    ) {
      return "Your identity is completely protected on AssignDump! All users have unique anonymous usernames, and no personal information is shared. You can upload assignments, submit solutions, and review work without revealing who you are. Your email is only used for account verification and notifications.";
    }

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

    if (
      message.includes("review") ||
      message.includes("rate") ||
      message.includes("rating") ||
      message.includes("feedback") ||
      message.includes("how to review")
    ) {
      return "To review a solution, go to any assignment page and scroll to the submissions section. Click on a solution to view it, then use the star rating system (1-5 stars) to rate it. You can also leave comments to provide constructive feedback. Your reviews help maintain quality and help other students find the best solutions!";
    }

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

    if (
      message.includes("can't upload") ||
      message.includes("upload not working") ||
      message.includes("file error") ||
      message.includes("upload failed")
    ) {
      return "If you're having trouble uploading, make sure your file is under 10MB and in a supported format (PDF, DOC, DOCX, images). Check your internet connection and try refreshing the page. If the problem persists, try logging out and back in, or clear your browser cache.";
    }

    if (
      message.includes("can't login") ||
      message.includes("login problem") ||
      message.includes("sign in") ||
      message.includes("forgot password") ||
      message.includes("otp")
    ) {
      return "To sign in, enter your email address and you'll receive a 6-digit OTP code via email. Enter the code to verify and access your account. If you don't receive the OTP, check your spam folder and wait a minute before requesting a new one. Make sure you're using the same email you registered with.";
    }

    if (
      message.includes("leaderboard") ||
      message.includes("rank") ||
      message.includes("ranking") ||
      message.includes("top") ||
      message.includes("position")
    ) {
      return "The leaderboard shows the top contributors ranked by points! You can view it by clicking 'Leaderboard' in the navigation. Your rank updates in real-time as you earn points from solving assignments and receiving ratings. Climb the ranks by consistently helping others with quality solutions!";
    }

    if (
      message.includes("browse") ||
      message.includes("search") ||
      message.includes("find assignment") ||
      message.includes("look for")
    ) {
      return "To browse assignments, click 'Browse' in the navigation bar. You can search by keywords, filter by subject or difficulty, and sort by newest, most popular, or deadline. This helps you find assignments you can help with or assignments similar to yours!";
    }

    if (
      message.includes("help") ||
      message.includes("how does") ||
      message.includes("what is") ||
      message.includes("how do i") ||
      message.includes("guide")
    ) {
      return "AssignDump is an anonymous student community where you can upload assignments for help, solve others' assignments to earn points, review solutions, and compete on the leaderboard. Start by uploading an assignment or browsing existing ones to solve. Everything is anonymous and secure!";
    }

    if (
      message.includes("hi") ||
      message.includes("hello") ||
      message.includes("hey") ||
      message.includes("greetings")
    ) {
      return "Hello! 👋 I'm here to help you with AssignDump. You can ask me about uploading assignments, earning points, reviewing solutions, anonymity, safety, or troubleshooting. What would you like to know?";
    }

    if (
      message.includes("thank") ||
      message.includes("thanks") ||
      message.includes("appreciate")
    ) {
      return "You're welcome! 😊 Happy to help. If you have any other questions, just ask!";
    }

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] animate-in fade-in duration-200 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Button - Glassmorphic Theme */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] w-14 h-14 sm:w-16 sm:h-16 rounded-full glass-morphism border border-[#13ec9c]/30 shadow-2xl shadow-[#13ec9c]/20 hover:shadow-[#13ec9c]/40 hover:border-[#13ec9c]/50 transition-all duration-300 flex items-center justify-center group hover:scale-110 active:scale-95 ${
          isOpen ? "scale-95 rotate-180" : "rotate-0"
        }`}
        aria-label="Open chatbot"
      >
        <div className="relative">
          {isOpen ? (
            <X className="w-6 h-6 sm:w-7 sm:h-7 text-[#13ec9c] transition-all duration-300" />
          ) : (
            <>
              <MessageCircleMore className="w-6 h-6 sm:w-7 sm:h-7 text-[#13ec9c] transition-transform group-hover:scale-110 duration-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#13ec9c] rounded-full animate-pulse shadow-lg shadow-[#13ec9c]/50"></div>
            </>
          )}
        </div>
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#13ec9c]/10 animate-ping"></span>
        )}
      </button>

      {/* Chat Window - Compact Side Design */}
      {isOpen && (
        <div
          ref={chatbotRef}
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-96 lg:w-[420px] h-[calc(100vh-8rem)] sm:h-[600px] lg:h-[680px] max-h-[680px] flex flex-col bg-[#0a110e] rounded-xl overflow-hidden shadow-2xl border border-[#13ec9c]/20 glass-morphism animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Section */}
          <header className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-[#13ec9c]/10 rounded-lg sm:rounded-xl border border-[#13ec9c]/20">
                <span className="material-symbols-outlined text-[#13ec9c] text-lg sm:text-xl" style={{ fontVariationSettings: '"FILL" 1, "wght" 400' }}>
                  school
                </span>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  AssignDump <span className="text-[#13ec9c] italic">AI</span>
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#13ec9c] animate-pulse"></span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#13ec9c] font-bold">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
            </button>
          </header>

          {/* Bot Intro Section - Compact */}
          <div className="flex flex-col items-center pt-6 sm:pt-8 pb-4 sm:pb-5 border-b border-white/5 bg-white/5 px-4">
            <div className="relative mb-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#13ec9c] to-[#10b981] p-0.5 shadow-lg shadow-[#13ec9c]/20">
                <div className="w-full h-full rounded-full bg-[#0a110e] flex items-center justify-center overflow-hidden">
                  <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-[#13ec9c]" />
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 sm:w-6 sm:h-6 bg-[#0a110e] border-2 border-[#13ec9c] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#13ec9c]" />
              </div>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white">Academic Intelligence Assistant</h2>
            <p className="text-white/50 text-[10px] sm:text-xs mt-0.5">High-Fidelity Learning Engine v4.2</p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 hide-scrollbar">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === "user" ? "flex-row-reverse self-end max-w-[85%] ml-auto" : "max-w-[85%]"
                }`}
              >
                {message.sender === "bot" ? (
                  <>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full glass-morphism shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#13ec9c] text-xs sm:text-sm" style={{ fontVariationSettings: '"FILL" 1, "wght" 400' }}>
                        smart_toy
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="glass-morphism px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl rounded-tl-none text-white/90 leading-relaxed text-xs sm:text-sm">
                        {message.text}
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-white/30 px-1 italic">
                        {formatTime(message.timestamp)} • AssignDump Bot
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#13ec9c]/20 shrink-0 flex items-center justify-center border border-[#13ec9c]/30">
                      <span className="material-symbols-outlined text-[#13ec9c] text-xs sm:text-sm" style={{ fontVariationSettings: '"FILL" 1, "wght" 400' }}>
                        person
                      </span>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="bg-[#13ec9c] px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl rounded-tr-none text-[#0a110e] font-medium leading-relaxed text-xs sm:text-sm shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_12px_rgba(19,236,156,0.3)]">
                        {message.text}
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-white/30 px-1 italic">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start gap-3 max-w-[85%]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full glass-morphism shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#13ec9c] text-xs sm:text-sm" style={{ fontVariationSettings: '"FILL" 1, "wght" 400' }}>
                    smart_toy
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="glass-morphism px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl rounded-tl-none">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#13ec9c] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#13ec9c] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#13ec9c] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Interaction Area */}
          <div className="p-4 sm:p-6 pt-0 border-t border-white/5">
            {/* Quick Action Capsules */}
            <div className="flex gap-2 mb-3 sm:mb-4 overflow-x-auto hide-scrollbar py-1">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.text)}
                  className="glass-morphism px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap border border-white/5 hover:border-[#13ec9c]/50 hover:bg-[#13ec9c]/5 transition-all text-white/70 hover:text-[#13ec9c] flex items-center gap-1.5 sm:gap-2"
                >
                  <action.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{action.text}</span>
                  <span className="sm:hidden">{action.text.split(" ")[0]}</span>
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-[#13ec9c]/20 blur-xl opacity-0 group-focus-within:opacity-40 transition-opacity"></div>
              <div className="relative flex items-center glass-morphism px-3 sm:px-4 py-2.5 sm:py-3 rounded-full border border-white/10 group-focus-within:border-[#13ec9c]/50 transition-all">
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-white/30 text-xs sm:text-sm px-2 sm:px-4 outline-none"
                  placeholder="Type your academic query..."
                  type="text"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-[#13ec9c] rounded-full flex items-center justify-center text-[#0a110e] shadow-lg shadow-[#13ec9c]/20 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ml-2"
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined font-bold text-base sm:text-xl" style={{ fontVariationSettings: '"FILL" 0, "wght" 400' }}>
                      arrow_forward
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Footer Meta */}
            <div className="mt-3 sm:mt-4 flex justify-center items-center">
              <p className="text-[9px] sm:text-[10px] text-white/20 uppercase tracking-[0.2em]">Encrypted Connection Secured</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
