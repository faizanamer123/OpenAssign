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
//           subject: "OpenAssign - Email Verification OTP",
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
//           subject: "OpenAssign - Email Verification OTP",
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
//       //   title: "Welcome to OpenAssign! 🎉",
//       //   description: "You've been signed in successfully. Let's get started!",
//       // });
//       toast({
//       title: (
//         <div className="flex items-center gap-2">
//           <PartyPopper className="w-5 h-5 text-green-600" />
//           <span>Welcome to OpenAssign!</span>
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
//                   {otpSent ? "Verify Your Email" : "Sign In to OpenAssign"}
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Trophy,
  Sparkles,
  Shield,
  Zap,
  BookOpen,
  Award,
  TrendingUp,
  LogIn,
  Upload,
  Search,
  Star,
  Users,
  CheckCircle,
  ArrowRight,
  FileCheck,
  MessageSquare,
  GraduationCap,
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
              <span className="block">The Education Platform for</span>
              <span className="block bg-gradient-to-r from-[#4ade80] to-[#9333ea] bg-clip-text text-transparent animate-gradient-x">
                Assignments, Peer Review & Solutions
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl leading-8 text-gray-300 max-w-3xl mx-auto">
              Get help with your assignments, review other students' work, upload solutions, and compete on the leaderboard. 
              Join thousands of students in our anonymous, secure educational community where learning and helping go hand in hand.
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

          {/* Feature Sections */}
          <div className="mt-32 space-y-24">
            {/* Upload Assignments Section */}
            <section className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-2xl mb-6 shadow-lg shadow-green-500/30">
                  <Upload className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Upload Assignments
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Stuck on an assignment? Upload it anonymously and get help from talented students in our community. 
                  Share your challenges and receive expert solutions quickly.
                </p>
              </div>
              <Card className="study-card max-w-4xl mx-auto">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-[#4ade80] flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-white font-semibold mb-1">Anonymous Upload</h3>
                            <p className="text-gray-300 text-sm">Your identity stays completely private</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-[#4ade80] flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-white font-semibold mb-1">Quick Responses</h3>
                            <p className="text-gray-300 text-sm">Get solutions from community members fast</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-[#4ade80] flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-white font-semibold mb-1">All Subjects Supported</h3>
                            <p className="text-gray-300 text-sm">Math, Science, CS, and more</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-[#4ade80]/10 to-[#22c55e]/10 rounded-xl p-8 border border-[#4ade80]/20 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#4ade80]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="text-center relative z-10">
                        <div className="relative inline-block mb-4">
                          <div className="absolute inset-0 bg-[#4ade80]/20 rounded-full blur-xl"></div>
                          <Upload className="h-32 w-32 text-[#4ade80] mx-auto relative z-10 animate-bounce-slow" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-[#4ade80] rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-[#4ade80] rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                            <div className="w-2 h-2 bg-[#4ade80] rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                          </div>
                          <p className="text-gray-400 text-sm font-medium">Upload your assignment files and get help</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Review Other Students' Work Section */}
            <section className="animate-slide-up" style={{ animationDelay: "0.6s" }}>
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#9333ea] to-[#7c3aed] rounded-2xl mb-6 shadow-lg shadow-purple-500/30">
                  <FileCheck className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Review Other Students' Work
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Help fellow students by reviewing and rating their solutions. Provide constructive feedback 
                  and help maintain quality standards in our educational community.
                </p>
              </div>
              <Card className="study-card max-w-4xl mx-auto">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="bg-gradient-to-br from-[#9333ea]/10 to-[#7c3aed]/10 rounded-xl p-8 border border-[#9333ea]/20 order-2 md:order-1 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#9333ea]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="text-center relative z-10">
                        <div className="relative inline-block mb-4">
                          <div className="absolute inset-0 bg-[#9333ea]/20 rounded-full blur-xl"></div>
                          <div className="relative z-10">
                            <FileCheck className="h-20 w-20 text-[#9333ea] mx-auto mb-2" />
                            <Star className="h-12 w-12 text-yellow-400 mx-auto fill-yellow-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                          <p className="text-gray-400 text-sm font-medium">Review and rate solutions</p>
                        </div>
                      </div>
                    </div>
                    <div className="order-1 md:order-2">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-[#9333ea] flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-white font-semibold mb-1">Rate Solutions</h3>
                            <p className="text-gray-300 text-sm">Give 1-5 star ratings to help others</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-[#9333ea] flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-white font-semibold mb-1">Build Reputation</h3>
                            <p className="text-gray-300 text-sm">Earn recognition for quality reviews</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-[#9333ea] flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-white font-semibold mb-1">Community Quality</h3>
                            <p className="text-gray-300 text-sm">Help maintain high standards</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Upload Solutions Section */}
            <section className="animate-slide-up" style={{ animationDelay: "0.8s" }}>
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-2xl mb-6 shadow-lg shadow-cyan-500/30">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Upload Solutions
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Help others by solving their assignments. Earn points, build your reputation, and climb 
                  the leaderboard while contributing to the educational community.
                </p>
              </div>
              <Card className="study-card max-w-4xl mx-auto">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-[#06b6d4] flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-white font-semibold mb-1">Earn Points</h3>
                            <p className="text-gray-300 text-sm">Get rewarded for every solution you provide</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-[#06b6d4] flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-white font-semibold mb-1">Help Others Learn</h3>
                            <p className="text-gray-300 text-sm">Make a difference in students' academic journey</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-[#06b6d4] flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-white font-semibold mb-1">Build Your Portfolio</h3>
                            <p className="text-gray-300 text-sm">Track all your contributions and achievements</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-[#06b6d4]/10 to-[#0891b2]/10 rounded-xl p-8 border border-[#06b6d4]/20 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#06b6d4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="text-center relative z-10">
                        <div className="relative inline-block mb-4">
                          <div className="absolute inset-0 bg-[#06b6d4]/20 rounded-full blur-xl"></div>
                          <div className="relative z-10 flex items-center justify-center">
                            <BookOpen className="h-28 w-28 text-[#06b6d4] animate-pulse-slow" />
                            <div className="absolute -top-2 -right-2">
                              <CheckCircle className="h-8 w-8 text-[#4ade80] bg-white rounded-full" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-400" />
                            <span className="text-xs text-gray-300 font-medium">+Points</span>
                          </div>
                          <p className="text-gray-400 text-sm font-medium">Share your knowledge and help others</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Leaderboard & Rankings Section */}
            <section className="animate-slide-up" style={{ animationDelay: "1s" }}>
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#ec4899] to-[#db2777] rounded-2xl mb-6 shadow-lg shadow-pink-500/30">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Leaderboard & Rankings
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Compete with other students on our leaderboard. Track your progress, earn badges, and 
                  see how you rank among the top contributors in our educational community.
                </p>
              </div>
              <Card className="study-card max-w-4xl mx-auto">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="bg-gradient-to-br from-[#ec4899]/10 to-[#db2777]/10 rounded-xl p-8 border border-[#ec4899]/20 order-2 md:order-1 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#ec4899]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="text-center relative z-10">
                        <div className="relative inline-block mb-4">
                          <div className="absolute inset-0 bg-[#ec4899]/20 rounded-full blur-xl"></div>
                          <div className="relative z-10">
                            <Trophy className="h-28 w-28 text-[#ec4899] mx-auto" />
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                              <TrendingUp className="h-6 w-6 text-[#4ade80]" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <div className="text-xs font-bold text-white bg-gradient-to-r from-[#ec4899] to-[#db2777] px-2 py-1 rounded">#1</div>
                            <span className="text-xs text-gray-300">Top Rank</span>
                          </div>
                          <p className="text-gray-400 text-sm font-medium">Climb the rankings</p>
                        </div>
                      </div>
                    </div>
                    <div className="order-1 md:order-2">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-[#ec4899] flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-white font-semibold mb-1">Real-time Rankings</h3>
                            <p className="text-gray-300 text-sm">See your position update as you earn points</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-[#ec4899] flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-white font-semibold mb-1">Achievement Badges</h3>
                            <p className="text-gray-300 text-sm">Unlock badges for milestones and achievements</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-[#ec4899] flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-white font-semibold mb-1">Track Progress</h3>
                            <p className="text-gray-300 text-sm">Monitor your growth and contributions</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Testimonials Section */}
          <section className="mt-32 animate-slide-up" style={{ animationDelay: "1.2s" }}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 rounded-2xl mb-6">
                <Users className="h-8 w-8 text-yellow-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                What Students Are Saying
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Join thousands of satisfied students who are getting help and helping others
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  name: "Sarah Chen",
                  role: "Computer Science Student",
                  rating: 5,
                  text: "This platform saved my semester! I got help with my algorithms assignment and the solution was clear and well-explained. The anonymous feature makes it so comfortable to ask for help.",
                  avatar: "SC",
                },
                {
                  name: "Michael Rodriguez",
                  role: "Mathematics Major",
                  rating: 5,
                  text: "I love helping others while earning points. The peer review system is great and I've learned so much by reviewing different solution approaches. Highly recommend!",
                  avatar: "MR",
                },
                {
                  name: "Emily Johnson",
                  role: "Engineering Student",
                  rating: 5,
                  text: "The leaderboard feature is motivating! I've climbed from rank 200 to top 50 by consistently helping others. The community is supportive and the quality of solutions is excellent.",
                  avatar: "EJ",
                },
                {
                  name: "David Kim",
                  role: "Physics Student",
                  rating: 4,
                  text: "Great platform for getting quick help with assignments. The rating system ensures quality, and I've received some really helpful solutions. The anonymous aspect is a huge plus.",
                  avatar: "DK",
                },
                {
                  name: "Jessica Martinez",
                  role: "Chemistry Major",
                  rating: 5,
                  text: "I've uploaded several assignments and always got responses within hours. The solutions are detailed and the reviewers are knowledgeable. This is exactly what I needed!",
                  avatar: "JM",
                },
                {
                  name: "Alex Thompson",
                  role: "Data Science Student",
                  rating: 5,
                  text: "Best educational platform I've used! The combination of getting help and helping others while tracking progress on the leaderboard is brilliant. 10/10 would recommend!",
                  avatar: "AT",
                },
              ].map((review, index) => (
                <Card key={index} className="study-card card-hover group hover:border-[#4ade80]/50 transition-all duration-300">
                  <CardContent className="p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#4ade80]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform" style={{ transitionDelay: `${i * 0.1}s` }} />
                          ))}
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-[#4ade80]/20 to-[#9333ea]/20 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
                          {review.avatar}
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4 leading-relaxed italic group-hover:text-white transition-colors">
                        "{review.text}"
                      </p>
                      <div className="border-t border-gray-700 pt-4 group-hover:border-[#4ade80]/30 transition-colors">
                        <p className="text-white font-semibold">{review.name}</p>
                        <p className="text-gray-400 text-sm">{review.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="mt-32 mb-16 animate-slide-up" style={{ animationDelay: "1.4s" }}>
            <Card className="study-card max-w-3xl mx-auto bg-gradient-to-br from-[#4ade80]/10 via-[#9333ea]/10 to-[#06b6d4]/10 border-2 border-[#4ade80]/30">
              <CardContent className="p-8 text-center">
                <GraduationCap className="h-12 w-12 text-[#4ade80] mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Ready to Get Started?
                </h2>
                <p className="text-base text-gray-300 mb-6 max-w-2xl mx-auto">
                  Join thousands of students who are already benefiting from our educational platform. 
                  Get help, help others, and climb the leaderboard - all while staying anonymous and secure.
                </p>
                <Link href="/register">
                  <Button className="duolingo-button px-6 py-3 h-auto font-semibold text-base group">
                    <LogIn className="mr-2 h-4 w-4" />
                    Register Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </div>
  );
}
