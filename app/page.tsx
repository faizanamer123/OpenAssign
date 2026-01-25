// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { useAuth } from "@/context/AuthContext";
// import { toast } from "@/hooks/use-toast";
// import { sendOTP, verifyOTP, checkEmailVerified } from "@/utils/api";
// import {
//   Loader2,
//   Trophy,
//   ArrowRight,
//   Sparkles,
//   Shield,
//   Zap,
//   BookOpen,
//   PartyPopper,
//   Award,
//   TrendingUp,
//   CheckCircle,
//   XCircle,
//   Mail,
//   Lock,
// } from "lucide-react";
// import { sendOtpEmail } from "@/lib/sendOtpEmail";
// import Logo from "@/components/ui/Logo";

// export default function LandingPage() {
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpVerified, setOtpVerified] = useState(false);
//   const [sendingOtp, setSendingOtp] = useState(false);
//   const [verifyingOtp, setVerifyingOtp] = useState(false);
//   const [countdown, setCountdown] = useState(0);
//   const [isVerified, setIsVerified] = useState(false);
//   const { signInWithEmail } = useAuth();
//   const router = useRouter();

//   // Countdown timer for resend OTP
//   useEffect(() => {
//     if (countdown > 0) {
//       const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [countdown]);

//   const handleSendOTP = async () => {
//     if (!email || !email.includes("@")) {
//       toast({
//         title: "Invalid Email",
//         description: "Please enter a valid email address",
//         variant: "destructive",
//       });
//       return;
//     }

//     setSendingOtp(true);
//     try {
//       // Check if user is already verified
//       const verified = await checkEmailVerified(email);
//       setIsVerified(verified);
//       if (verified) {
//         await signInWithEmail(email);
//         await router.replace("/home");
//         // toast({
//         //   title: "Welcome back! 🎉",
//         //   description: "You've been signed in successfully.",
//         // });
//         toast({
//           description: (
//             <div className="flex items-center gap-2">
//               <PartyPopper className="w-5 h-5 text-green-600" />
//               <span>You've been signed in successfully.</span>
//             </div>
//           ),
//         });
//         setSendingOtp(false);
//         return;
//       }
//       // Otherwise, proceed with OTP flow
//       const result = await sendOTP(email);
//       if (result.success && result.otp) {
//         // Send OTP email notification via EmailJS
//         await sendOtpEmail({
//           toEmail: email,
//           userName: email.split("@")[0],
//           otpCode: result.otp,
//           subject: "AssignDump - Email Verification OTP",
//           message: "Use the code below to verify your email address.",
//         });
//         setOtpSent(true);
//         setCountdown(60);
//         // toast({
//         //   title: "OTP Sent! 📧",
//         //   description: "Check your email for the verification code.",
//         // });
//       toast({
//         title: (
//           <div className="flex items-center gap-2">
//             <Mail className="w-5 h-5 text-green-600" />
//             <span>OTP Sent!</span>
//           </div>
//         ),
//         description: "Check your email for the verification code.",
//       });
//       } else {
//         toast({
//           title: "Failed to send OTP",
//           description: result.error || "Please try again",
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to send OTP. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setSendingOtp(false);
//     }
//   };

//   const handleVerifyOTP = async () => {
//     if (!otp || otp.length !== 6) {
//       toast({
//         title: "Invalid OTP",
//         description: "Please enter the 6-digit code from your email",
//         variant: "destructive",
//       });
//       return;
//     }

//     setVerifyingOtp(true);
//     try {
//       const result = await verifyOTP(email, otp);
//       if (result.success) {
//         setOtpVerified(true);
//         setOtp(""); // Clear OTP input after success
//         await signInWithEmail(email);
//         router.push("/home");
//         setTimeout(() => {
//           // toast({
//           //   title: "Welcome! 🎉",
//           //   description: "You've been signed in successfully.",
//           // });
//         toast({
//             description: (
//               <div className="flex items-center gap-2">
//                 <PartyPopper className="w-5 h-5 text-green-600" />
//                 <span>You've been signed in successfully.</span>
//               </div>
//             ),
//           });
//         }, 100);
//       } else {
//         toast({
//           title: "Invalid OTP",
//           description: result.error || "Please check the code and try again",
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to verify OTP. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setVerifyingOtp(false);
//     }
//   };

//   const handleResendOTP = async () => {
//     if (countdown > 0) return;
//     setSendingOtp(true);
//     try {
//       const result = await sendOTP(email);
//       if (result.success && result.otp) {
//         // Send OTP email notification via EmailJS
//         await sendOtpEmail({
//           toEmail: email,
//           userName: email.split("@")[0],
//           otpCode: result.otp,
//           subject: "AssignDump - Email Verification OTP",
//           message: "Use the code below to verify your email address.",
//         });
//         setCountdown(60);
//         setOtp(""); // Clear OTP input after resend
//       toast({
//         title: (
//           <div className="flex items-center gap-2">
//             <Mail className="w-5 h-5 text-green-600" />
//             <span>OTP Sent!</span>
//           </div>
//         ),
//         description: "Check your email for the verification code.",
//       });
//       } else {
//         toast({
//           title: "Failed to resend OTP",
//           description: result.error || "Please try again",
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to resend OTP. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setSendingOtp(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!email || !otpVerified) return;

//     setLoading(true);
//     try {
//       await signInWithEmail(email);
//       await router.replace("/home");
//       // toast({
//       //   title: "Welcome to AssignDump! 🎉",
//       //   description: "You've been signed in successfully. Let's get started!",
//       // });
//       toast({
//       title: (
//         <div className="flex items-center gap-2">
//           <PartyPopper className="w-5 h-5 text-green-600" />
//           <span>Welcome to AssignDump!</span>
//         </div>
//       ),
//       description: "You've been signed in successfully. Let's get started!",
//     });
//     } catch (error) {
//       toast({
//         title: "Oops! Something went wrong",
//         description: "Failed to sign in. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setEmail("");
//     setOtp("");
//     setOtpSent(false);
//     setOtpVerified(false);
//     setCountdown(0);
//     setIsVerified(false);
//   };

//   return (
//     <div className="min-h-screen reddit-dark-bg overflow-hidden animate-fade-in">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-20 left-10 w-72 h-72 bg-[#4ade80]/15 rounded-full blur-3xl floating-animation"></div>
//         <div
//           className="absolute top-40 right-20 w-96 h-96 bg-[#9333ea]/8 rounded-full blur-3xl floating-animation"
//           style={{ animationDelay: "1s" }}
//         ></div>
//         <div
//           className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#06b6d4]/12 rounded-full blur-3xl floating-animation"
//           style={{ animationDelay: "2s" }}
//         ></div>
//       </div>

//       {/* Header */}
//       <header className="relative z-10 px-4 sm:px-6 lg:px-10 py-4">
//         <div className="flex items-center justify-between max-w-7xl mx-auto">
//           <Logo href="/" variant="large" logoSize={56} />
//         </div>
//       </header>

//       {/* Hero Section */}
//       <div className="relative z-10 px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
//         <div className="mx-auto max-w-6xl">
//           <div className="text-center animate-slide-up">
//             <div className="inline-flex items-center gap-2 bg-[#4ade80]/20 border border-[#4ade80]/30 rounded-full px-4 py-2 mb-8 shadow-sm neon-border">
//               <Sparkles className="w-4 h-4 text-[#4ade80] animate-bounce" />
//               <span className="text-sm font-medium text-white">
//                 100% Anonymous • Secure • Rewarding
//               </span>
//             </div>

//             <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-lg">
//               <span className="block">Anonymous</span>
//               <span className="block bg-gradient-to-r from-[#4ade80] to-[#9333ea] bg-clip-text text-transparent animate-gradient-x">
//                 Assignment Platform
//               </span>
//             </h1>

//             <p className="mt-6 text-lg sm:text-xl leading-8 text-gray-300 max-w-3xl mx-auto">
//               Upload assignments to get help or solve others' assignments to
//               earn points and recognition. Join a thriving community of students
//               helping each other succeed.
//             </p>

//             {/* Stats */}
//             <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
//               <div
//                 className="text-center animate-scale-in"
//                 style={{ animationDelay: "0.2s" }}
//               >
//                 <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow">
//                   1,200+
//                 </div>
//                 <div className="text-sm text-gray-300">Students</div>
//               </div>
//               <div
//                 className="text-center animate-scale-in"
//                 style={{ animationDelay: "0.4s" }}
//               >
//                 <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow">
//                   850+
//                 </div>
//                 <div className="text-sm text-gray-300">Assignments</div>
//               </div>
//               <div
//                 className="text-center animate-scale-in"
//                 style={{ animationDelay: "0.6s" }}
//               >
//                 <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow">
//                   95%
//                 </div>
//                 <div className="text-sm text-gray-300">Success Rate</div>
//               </div>
//               <div
//                 className="text-center animate-scale-in"
//                 style={{ animationDelay: "0.8s" }}
//               >
//                 <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow">
//                   4.9★
//                 </div>
//                 <div className="text-sm text-gray-300">Rating</div>
//               </div>
//             </div>
//           </div>

//           {/* Auth Card */}
//           <div
//             className="mt-16 flex justify-center animate-scale-in"
//             style={{ animationDelay: "1s" }}
//           >
//             <Card className="w-full max-w-md study-card shadow-2xl card-hover">
//               <CardHeader className="text-center pb-4">
//                 <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
//                   {otpSent ? (
//                     <Lock className="w-8 h-8 text-white" />
//                   ) : (
//                     <Mail className="w-8 h-8 text-white" />
//                   )}
//                 </div>
//                 <CardTitle className="text-2xl text-white">
//                   {otpSent ? "Verify Your Email" : "Sign In to AssignDump"}
//                 </CardTitle>
//                 <CardDescription className="text-gray-300">
//                   {otpSent
//                     ? "Enter the 6-digit code sent to your email"
//                     : isVerified
//                     ? "Your email is already verified. Logging you in..."
//                     : "Enter your email to get started (new users will be created automatically)"}
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="pt-0">
//                 {!otpSent && !isVerified ? (
//                   // Email Input Step
//                   <div className="space-y-6">
//                     <div className="space-y-2">
//                       <Input
//                         type="email"
//                         placeholder="your.email@university.edu"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         required
//                         className="h-12 border-[#4ade80]/30 bg-[#1a1a1f]/50 focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/20 transition-all text-white"
//                       />
//                     </div>
//                     <Button
//                       onClick={handleSendOTP}
//                       className="w-full h-12 duolingo-button font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
//                       disabled={sendingOtp || !email}
//                     >
//                       {sendingOtp ? (
//                         <>
//                           <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                           Sending OTP...
//                         </>
//                       ) : (
//                         <>
//                           Send Verification Code
//                           <ArrowRight className="ml-2 h-5 w-5" />
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                 ) : null}
//                 {/* OTP Verification Step */}
//                 {otpSent && !isVerified && (
//                   <div className="space-y-6">
//                     <div className="space-y-2">
//                       <Input
//                         type="text"
//                         placeholder="Enter 6-digit code"
//                         value={otp}
//                         onChange={(e) =>
//                           setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
//                         }
//                         maxLength={6}
//                         className="h-12 border-[#4ade80]/30 bg-[#1a1a1f]/50 focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/20 transition-all text-center text-lg font-mono text-white"
//                       />
//                       <p className="text-sm text-gray-300 text-center">
//                         Code sent to{" "}
//                         <span className="font-medium text-white">{email}</span>
//                       </p>
//                     </div>
//                     <div className="space-y-3">
//                       <Button
//                         onClick={handleVerifyOTP}
//                         className="w-full h-12 duolingo-button font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
//                         disabled={verifyingOtp || otp.length !== 6}
//                       >
//                         {verifyingOtp ? (
//                           <>
//                             <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                             Verifying...
//                           </>
//                         ) : (
//                           <>
//                             Verify Code
//                             <CheckCircle className="ml-2 h-5 w-5" />
//                           </>
//                         )}
//                       </Button>
//                       {otpVerified && (
//                         <Button
//                           onClick={handleSubmit}
//                           className="w-full h-12 duolingo-button font-semibold"
//                           disabled={loading}
//                         >
//                           {loading ? (
//                             <>
//                               <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                               Creating Account...
//                             </>
//                           ) : (
//                             <>
//                               Create Account & Continue
//                               <ArrowRight className="ml-2 h-5 w-5" />
//                             </>
//                           )}
//                         </Button>
//                       )}
//                       <div className="flex items-center justify-between">
//                         <button
//                           type="button"
//                           onClick={resetForm}
//                           className="text-sm text-gray-300 hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-[#4ade80]/10"
//                         >
//                           ← Back to email
//                         </button>
//                         <button
//                           type="button"
//                           onClick={handleResendOTP}
//                           disabled={countdown > 0}
//                           className="text-sm text-[#4ade80] hover:text-[#22c55e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded-lg hover:bg-[#4ade80]/10"
//                         >
//                           {countdown > 0
//                             ? `Resend in ${countdown}s`
//                             : "Resend code"}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//                 {/* If verified, show a loading spinner and message */}
//                 {isVerified && !otpSent && (
//                   <div className="flex flex-col items-center justify-center py-8">
//                     <Loader2 className="h-8 w-8 text-[#4ade80] animate-spin mb-4" />
//                     <p className="text-gray-300 text-center">
//                       Logging you in...
//                     </p>
//                   </div>
//                 )}
//                                  <p className="text-xs text-gray-400 text-center mt-4">
//                    By continuing, you agree to our{" "}
//                    <a href="/terms" className="underline hover:text-[#4ade80] transition-colors">
//                      Terms of Service
//                    </a>{" "}
//                    and{" "}
//                    <a
//                      href="/privacy-policy"
//                      className="underline hover:text-[#4ade80] transition-colors"
//                    >
//                      Privacy Policy
//                    </a>
//                    .
//                  </p>
//               </CardContent>
//             </Card>
//           </div>

//                      {/* Features Grid */}
//            <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//              {[
//                {
//                  icon: <Shield className="h-8 w-8 text-white" />,
//                  title: "100% Anonymous",
//                  color: "from-[#4ade80] to-[#22c55e]",
//                },
//                {
//                  icon: <Trophy className="h-8 w-8 text-white" />,
//                  title: "Earn Points & Recognition",
//                  color: "from-[#9333ea] to-[#7c3aed]",
//                },
//                {
//                  icon: <Zap className="h-8 w-8 text-white" />,
//                  title: "Instant Notifications",
//                  color: "from-[#06b6d4] to-[#0891b2]",
//                },
//                {
//                  icon: <BookOpen className="h-8 w-8 text-white" />,
//                  title: "All Subjects",
//                  color: "from-[#ec4899] to-[#db2777]",
//                },
//                {
//                  icon: <Award className="h-8 w-8 text-white" />,
//                  title: "Quality Solutions",
//                  color: "from-[#4ade80] to-[#22c55e]",
//                },
//                {
//                  icon: <TrendingUp className="h-8 w-8 text-white" />,
//                  title: "Track Progress",
//                  color: "from-[#9333ea] to-[#7c3aed]",
//                },
//              ].map((feature, i) => (
//                                <Card
//                   key={feature.title}
//                   className={`study-card card-hover animate-slide-up shadow-md hover:shadow-xl transition-shadow duration-300 group`}
//                   style={{ animationDelay: `${0.2 + i * 0.2}s` }}
//                 >
//                  <CardContent className="px-8 py-8 text-center">
//                    <div
//                      className={`mx-auto w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
//                    >
//                      {feature.icon}
//                    </div>
//                    <h3 className="text-xl font-semibold text-white mb-3">
//                      {feature.title}
//                    </h3>
//                    <p className="text-gray-300 leading-relaxed">
//                      {feature.title === "100% Anonymous" &&
//                        "Complete privacy with unique anonymous usernames. Your identity stays protected while you help others."}
//                      {feature.title === "Earn Points & Recognition" &&
//                        "Solve assignments to earn points, climb the leaderboard, and build your reputation in the community."}
//                      {feature.title === "Instant Notifications" &&
//                        "Get notified when your assignments are solved or when you receive ratings for your solutions."}
//                      {feature.title === "All Subjects" &&
//                        "From Mathematics to Computer Science, get help with assignments across all academic disciplines."}
//                      {feature.title === "Quality Solutions" &&
//                        "Rate and review solutions to ensure high-quality help. Build trust through our community-driven system."}
//                      {feature.title === "Track Progress" &&
//                        "Monitor your uploaded assignments and submitted solutions with detailed activity tracking."}
//                    </p>
//                  </CardContent>
//                </Card>
//              ))}
//            </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trophy,
  Sparkles,
  Shield,
  Zap,
  BookOpen,
  TrendingUp,
  LogIn,
  GraduationCap,
  Rocket,
  CloudUpload,
  BarChart3,
  Brain,
  LogOut,
  Menu,
  X,
  FileCheck,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden font-display text-white">
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
      <header className={`fixed top-4 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-500 ${isScrolled ? 'lg:-translate-y-24 lg:opacity-0' : 'lg:translate-y-0 lg:opacity-100'}`}>
        <div className="navbar-glass max-w-7xl w-full h-14 sm:h-16 lg:h-20 rounded-full flex items-center justify-between px-3 sm:px-4 lg:px-6 transition-all duration-500">
          <Logo href="/" variant="default" logoSize={28} disableHover={true} />
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-3 sm:gap-4 lg:gap-6 ml-auto">
            <Link href="/register">
              <button className="glossy-pill px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-xs sm:text-sm font-black text-[#0a0f0d] rounded-full hover:scale-105 active:scale-95 transition-all">
                JOIN FREE
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden text-white/60 hover:text-white transition-colors p-2"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 mx-4 navbar-glass rounded-xl p-3 sm:hidden animate-scaleIn">
            <div className="flex flex-col gap-3">
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <button className="glossy-pill w-full px-4 py-2 text-xs font-black text-[#0a0f0d] rounded-full hover:scale-105 active:scale-95 transition-all">
                  JOIN FREE
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 lg:pt-48 pb-24 sm:pb-48 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
          <div className="relative z-10 text-left">
            <div className="inline-flex items-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-[#13ec9c] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-6 sm:mb-10">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              Ultimate Dataset Hub
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black leading-[0.95] mb-6 sm:mb-10 tracking-tight">
              <span className="font-serif italic font-bold">Access</span> Premium Datasets & <br/>
              <span className="text-[#13ec9c] hero-glow-text">Research Resources</span>
            </h1>
            <p className="text-base sm:text-xl text-white/60 max-w-xl mb-8 sm:mb-12 leading-relaxed font-light">
              Download research papers, exam materials, job prep guides, and exclusive datasets including satellite imagery and sensitive data. Free and premium resources for every need.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
              <Link href="/register" className="w-full sm:w-auto">
                <button className="glossy-pill w-full sm:w-auto px-12 py-6 text-lg font-black text-[#0a0f0d] rounded-full flex items-center justify-center gap-3 transition-all">
                  <LogIn className="w-5 h-5" />
                  Register
                </button>
              </Link>
            </div>
          </div>
          <div className="relative flex justify-center items-center h-[300px] sm:h-[400px] lg:h-[500px] mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-[#13ec9c]/10 blur-[150px] rounded-full"></div>
            <div className="relative floating-3d">
              <div className="relative z-20 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 glass-morphism rounded-[2rem] sm:rounded-[3rem] border-white/20 flex items-center justify-center rotate-12">
                <GraduationCap className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 text-[#13ec9c]/40 select-none" />
                <div className="absolute -bottom-6 sm:-bottom-10 -right-6 sm:-right-10 w-12 h-48 sm:w-16 sm:h-64 bg-gradient-to-t from-[#13ec9c] to-transparent blur-2xl opacity-40 rotate-45"></div>
                <FileCheck className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 text-[#13ec9c] absolute -bottom-2 sm:-bottom-4 -right-2 sm:-right-4 drop-shadow-[0_0_15px_rgba(19,236,156,0.8)] -rotate-45" />
                  </div>
              </div>
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 glass-morphism rounded-xl sm:rounded-2xl flex items-center justify-center floating-3d" style={{ animationDelay: "-2s" }}>
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-[#13ec9c]" />
            </div>
            <div className="absolute bottom-6 sm:bottom-10 left-0 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 glass-morphism rounded-full flex items-center justify-center floating-3d" style={{ animationDelay: "-4s" }}>
              <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#13ec9c]" />
            </div>
                </div>
                </div>
      </section>

          {/* Feature Sections */}
          <section className="py-16 sm:py-24 lg:py-32 relative" id="how-it-works">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16 lg:mb-24">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-8 tracking-tighter">Engineered for Success</h2>
                <p className="text-white/40 max-w-2xl mx-auto text-base sm:text-lg lg:text-xl font-light px-4">A seamless three-step workflow designed to access premium datasets and research resources instantly.</p>
                </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                <div className="hover-card glass-morphism p-6 sm:p-8 lg:p-12 rounded-xl sm:rounded-2xl transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#13ec9c]/5 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 group-hover:bg-[#13ec9c]/10 transition-colors"></div>
                  <div className="size-16 sm:size-20 rounded-xl sm:rounded-2xl bg-[#13ec9c]/10 border border-[#13ec9c]/20 flex items-center justify-center text-[#13ec9c] mb-6 sm:mb-10 group-hover:scale-110 transition-transform">
                    <CloudUpload className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
              </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Browse</h3>
                  <p className="text-white/50 leading-relaxed text-sm sm:text-base lg:text-lg font-light">Explore our extensive collection of research papers, exam materials, and premium datasets including satellite imagery and sensitive data.</p>
                  <div className="mt-6 sm:mt-10 flex items-center text-[#13ec9c] font-bold text-xs sm:text-sm gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    LEARN MORE <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                <div className="hover-card glass-morphism p-6 sm:p-8 lg:p-12 rounded-xl sm:rounded-2xl transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#13ec9c]/5 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 group-hover:bg-[#13ec9c]/10 transition-colors"></div>
                  <div className="size-16 sm:size-20 rounded-xl sm:rounded-2xl bg-[#13ec9c]/10 border border-[#13ec9c]/20 flex items-center justify-center text-[#13ec9c] mb-6 sm:mb-10 group-hover:scale-110 transition-transform">
                    <Brain className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
                          </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Download</h3>
                  <p className="text-white/50 leading-relaxed text-sm sm:text-base lg:text-lg font-light">Get instant access to free and premium datasets. Download research papers, exam materials, job prep guides, and exclusive leaked data.</p>
                  <div className="mt-6 sm:mt-10 flex items-center text-[#13ec9c] font-bold text-xs sm:text-sm gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    LEARN MORE <ArrowRight className="w-3 h-3" />
                        </div>
                          </div>
                <div className="hover-card glass-morphism p-6 sm:p-8 lg:p-12 rounded-xl sm:rounded-2xl transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#13ec9c]/5 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 group-hover:bg-[#13ec9c]/10 transition-colors"></div>
                  <div className="size-16 sm:size-20 rounded-xl sm:rounded-2xl bg-[#13ec9c]/10 border border-[#13ec9c]/20 flex items-center justify-center text-[#13ec9c] mb-6 sm:mb-10 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
                        </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Excel</h3>
                  <p className="text-white/50 leading-relaxed text-sm sm:text-base lg:text-lg font-light">Leverage premium datasets for your projects and career. Access satellite imagery, sensitive data, and exclusive research materials to excel in your field.</p>
                  <div className="mt-6 sm:mt-10 flex items-center text-[#13ec9c] font-bold text-xs sm:text-sm gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    LEARN MORE <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                        </div>
                          </div>
            </section>

          {/* Testimonials Section */}
          <section className="py-16 sm:py-24 lg:py-32 overflow-hidden" id="testimonials">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 lg:mb-16">
                          <div>
                <h2 className="text-3xl sm:text-4xl font-black mb-2 sm:mb-4 tracking-tight">Dataset User Reviews</h2>
                <p className="text-white/40 text-sm sm:text-base">Trusted by researchers and students worldwide for premium datasets.</p>
                          </div>
                        </div>
            <div className="grid grid-cols-3 md:grid-cols-3 lg:flex lg:gap-8 lg:overflow-x-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:hide-scrollbar lg:snap-x lg:snap-mandatory gap-2 sm:gap-3 md:gap-4">
              {[
                {
                  name: "Dr. Alex Thompson",
                  role: "Data Science Researcher",
                  rating: 5,
                  text: "The satellite datasets are incredible! High-resolution imagery with proper metadata. The premium datasets including sensitive user information have been invaluable for my ML research projects.",
                  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlT6BTkeun0U80Eohh37hW4fIy6I1wG6PwbBa36yCI8qtQIR2ovgVjuuW8RSKhcO4mbcXMAfXHIr6m-zjd2gncrUtAAaN-Cz8eJ6Bc2ix5SqREqTXZj4JF-faz7PrhdN5yu1nWWqRYEcSH9Jpj2eM4Pi4WjWQ3wVp-yg4BJt3e_awy9eb76rRfb5OTuQfXLoFZCY-aMTBZzl3Ei6dPeEVQpJzGbLKF9sJNaeWYo7KjYi9I6CDhxrqnxAOX-N9snup1AyBvmtT1B_A",
                },
                {
                  name: "Maria Rodriguez",
                  role: "Job Seeker",
                  rating: 5,
                  text: "Found amazing job preparation materials here! The interview guides and leaked datasets helped me land my dream job at a top tech company. Worth every penny for the premium resources.",
                  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdr32S9Wj2FUuh_cuxxSpHbFV7D6t_UpKHPhf0idRmC8HuIZgrwiM1nxoqnyDPkGPS79nh5G_sDCj9cmLDp9q4aS6mnocVog24onFt8B-m8lhluGW-edF5RgH_-KYsMgDHlI67qIhxtDk_gK_afwwTlwkKbArjpaSa1z7nAA1USQxdV7orrBjnD_doCUPnEDkClJIQyHvcYWlQ72Q1pW9aNPV_siZ8ZOcoWP3SpaQjaDHm0Py7Qts03MFSrTmTkPJZksdiVMZczoA",
                },
                {
                  name: "James Liu",
                  role: "Computer Science Student",
                  rating: 5,
                  text: "The past exam papers and research papers saved my academic life! Free resources are great, but the premium datasets including satellite imagery took my projects to the next level.",
                  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAItKgYq3k3Ko5GjMsfMBIpbP51UQbTFahuMWhxBoK725XjBAr0S1wscvaa13QcDrSgyDyBIUWU0a8LAPa1Dp-pfCqE4lu19zNKXj4Xw3aMP9bJROThZkLNSti-EdTIg-G_j91ZENLRc3pAdmecuzMrrzevJvgCkRO7obvv-gifcXse2Pm3i6FZcTCvTB_zRhr01t98sBnXVk5yUdAOklu2OSSeUQO-6ETZVdgkH2g3pjY1I12hKmq-dmQMPvxrFlnlm_XOSGP3cBc",
                },
              ].map((review, index) => (
                <div key={index} className="snap-center shrink-0 w-full lg:w-[450px] glass-morphism p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] relative">
                  <div className="absolute inset-0 testimonial-glow -z-10 rounded-xl sm:rounded-2xl lg:rounded-[2.5rem]"></div>
                  <div className="flex gap-0.5 sm:gap-1 text-[#13ec9c] mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                          {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 fill-[#13ec9c] text-[#13ec9c]" />
                          ))}
                        </div>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-white/80 italic mb-4 sm:mb-6 md:mb-8 lg:mb-10 leading-relaxed line-clamp-4 sm:line-clamp-none">"{review.text}"</p>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 md:gap-4 lg:gap-5">
                    <div className="size-8 sm:size-10 md:size-12 lg:size-16 rounded-full border-2 border-[#13ec9c]/50 overflow-hidden shadow-[0_0_20px_rgba(19,236,156,0.2)] flex-shrink-0">
                      <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                        </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs sm:text-sm md:text-base lg:text-lg font-bold">{review.name}</p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-[#13ec9c] font-medium tracking-wide">{review.role}</p>
                      </div>
                      </div>
                    </div>
              ))}
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
            <div className="bg-gradient-to-r from-[#13ec9c] to-cyan-500 rounded-2xl sm:rounded-3xl lg:rounded-[3.5rem] p-6 sm:p-8 md:p-12 lg:p-20 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <div className="relative z-10">
                <h2 className="text-[#0a0f0d] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-black mb-4 sm:mb-6 md:mb-8 lg:mb-10 tracking-tighter px-2">Ready to access premium datasets?</h2>
                <p className="text-[#0a0f0d]/70 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium mb-6 sm:mb-8 md:mb-12 lg:mb-16 max-w-2xl mx-auto px-2 sm:px-4">Start downloading research papers, exam materials, and exclusive datasets today. Access both free and premium resources including satellite data and sensitive information.</p>
                <Link href="/register" className="inline-block w-full sm:w-auto max-w-full">
                  <button className="pulse-btn w-full sm:w-auto px-16 py-8 glass-morphism !bg-[#0a0f0d] text-white text-2xl font-black rounded-[2rem] hover:scale-105 transition-all shadow-2xl flex items-center gap-4 mx-auto">
                    Download Your First Dataset Free
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-white/20 rounded-full blur-[100px] -mr-24 sm:-mr-32 lg:-mr-48 -mt-24 sm:-mt-32 lg:-mt-48"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-[#0a0f0d]/10 rounded-full blur-[100px] -ml-24 sm:-ml-32 lg:-ml-48 -mb-24 sm:-mb-32 lg:-mb-48"></div>
            </div>
          </section>

    </div>
  );
}
