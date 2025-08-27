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
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input-new"; // Changed from "@/components/ui/input" to "@/components/ui/input-new"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { sendOTP, verifyOTP, checkEmailVerified } from "@/utils/api";
import {
  Loader2,
  Trophy,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  BookOpen,
  PartyPopper,
  Award,
  TrendingUp,
  CheckCircle,
  XCircle,
  Mail,
  Lock,
} from "lucide-react";
import { sendOtpEmail } from "@/lib/sendOtpEmail";
import Logo from "@/components/ui/Logo";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const { signInWithEmail } = useAuth();
  const router = useRouter();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setSendingOtp(true);
    try {
      // Check if user is already verified
      const verified = await checkEmailVerified(email);
      setIsVerified(verified);
      if (verified) {
        await signInWithEmail(email);
        await router.replace("/home");
        toast({
          description: (
            <div className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-green-600" />
              <span>You've been signed in successfully.</span>
            </div>
          ),
        });
        setSendingOtp(false);
        return;
      }
      // Otherwise, proceed with OTP flow
      const result = await sendOTP(email);
      if (result.success && result.otp) {
        // Send OTP email notification via EmailJS
        await sendOtpEmail({
          toEmail: email,
          userName: email.split("@")[0],
          otpCode: result.otp,
          subject: "OpenAssign - Email Verification OTP",
          message: "Use the code below to verify your email address.",
        });
        setOtpSent(true);
        setCountdown(60);
        toast({
          title: (
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              <span>OTP Sent!</span>
            </div>
          ),
          description: "Check your email for the verification code.",
        });
      } else {
        toast({
          title: "Failed to send OTP",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code from your email",
        variant: "destructive",
      });
      return;
    }

    setVerifyingOtp(true);
    try {
      const result = await verifyOTP(email, otp);
      if (result.success) {
        setOtpVerified(true);
        setOtp(""); // Clear OTP input after success
        await signInWithEmail(email);
        router.push("/home");
        setTimeout(() => {
          toast({
            description: (
              <div className="flex items-center gap-2">
                <PartyPopper className="w-5 h-5 text-green-600" />
                <span>You've been signed in successfully.</span>
              </div>
            ),
          });
        }, 100);
      } else {
        toast({
          title: "Invalid OTP",
          description: result.error || "Please check the code and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setSendingOtp(true);
    try {
      const result = await sendOTP(email);
      if (result.success && result.otp) {
        // Send OTP email notification via EmailJS
        await sendOtpEmail({
          toEmail: email,
          userName: email.split("@")[0],
          otpCode: result.otp,
          subject: "OpenAssign - Email Verification OTP",
          message: "Use the code below to verify your email address.",
        });
        setCountdown(60);
        setOtp(""); // Clear OTP input after resend
        toast({
          title: (
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              <span>OTP Sent!</span>
            </div>
          ),
          description: "Check your email for the verification code.",
        });
      } else {
        toast({
          title: "Failed to resend OTP",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otpVerified) return;

    setLoading(true);
    try {
      await signInWithEmail(email);
      await router.replace("/home");
      toast({
        title: (
          <div className="flex items-center gap-2">
            <PartyPopper className="w-5 h-5 text-green-600" />
            <span>Welcome to OpenAssign!</span>
          </div>
        ),
        description: "You've been signed in successfully. Let's get started!",
      });
    } catch (error) {
      toast({
        title: "Oops! Something went wrong",
        description: "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setCountdown(0);
    setIsVerified(false);
  };

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

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div
                className="text-center animate-scale-in"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow">
                  1,200+
                </div>
                <div className="text-sm text-gray-300">Students</div>
              </div>
              <div
                className="text-center animate-scale-in"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow">
                  850+
                </div>
                <div className="text-sm text-gray-300">Assignments</div>
              </div>
              <div
                className="text-center animate-scale-in"
                style={{ animationDelay: "0.6s" }}
              >
                <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow">
                  95%
                </div>
                <div className="text-sm text-gray-300">Success Rate</div>
              </div>
              <div
                className="text-center animate-scale-in"
                style={{ animationDelay: "0.8s" }}
              >
                <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow">
                  4.9★
                </div>
                <div className="text-sm text-gray-300">Rating</div>
              </div>
            </div>
          </div>

          {/* Auth Card */}
          <div
            className="mt-16 flex justify-center animate-scale-in"
            style={{ animationDelay: "1s" }}
          >
            <Card className="w-full max-w-md study-card shadow-2xl card-hover">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  {otpSent ? (
                    <Lock className="w-8 h-8 text-white" />
                  ) : (
                    <Mail className="w-8 h-8 text-white" />
                  )}
                </div>
                <CardTitle className="text-2xl text-white">
                  {otpSent ? "Verify Your Email" : "Sign In to OpenAssign"}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {otpSent
                    ? "Enter the 6-digit code sent to your email"
                    : isVerified
                    ? "Your email is already verified. Logging you in..."
                    : "Enter your email to get started (new users will be created automatically)"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {!otpSent && !isVerified ? (
                  // Email Input Step
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="your.email@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        // className="h-12"
                      />
                    </div>
                    <Button
                      onClick={handleSendOTP}
                      className="w-full h-12 duolingo-button font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={sendingOtp || !email}
                    >
                      {sendingOtp ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          Send Verification Code
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                ) : null}
                {/* OTP Verification Step */}
                {otpSent && !isVerified && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        maxLength={6}
                        // className="h-12 text-center text-lg font-mono"
                      />
                      <p className="text-sm text-gray-300 text-center">
                        Code sent to{" "}
                        <span className="font-medium text-white">{email}</span>
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Button
                        onClick={handleVerifyOTP}
                        className="w-full h-12 duolingo-button font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={verifyingOtp || otp.length !== 6}
                      >
                        {verifyingOtp ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify Code
                            <CheckCircle className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                      {otpVerified && (
                        <Button
                          onClick={handleSubmit}
                          className="w-full h-12 duolingo-button font-semibold"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Creating Account...
                            </>
                          ) : (
                            <>
                              Create Account & Continue
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>
                      )}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={resetForm}
                          className="text-sm text-gray-300 hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-[#4ade80]/10"
                        >
                          ← Back to email
                        </button>
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={countdown > 0}
                          className="text-sm text-[#4ade80] hover:text-[#22c55e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded-lg hover:bg-[#4ade80]/10"
                        >
                          {countdown > 0
                            ? `Resend in ${countdown}s`
                            : "Resend code"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* If verified, show a loading spinner and message */}
                {isVerified && !otpSent && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 text-[#4ade80] animate-spin mb-4" />
                    <p className="text-gray-300 text-center">
                      Logging you in...
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-400 text-center mt-4">
                  By continuing, you agree to our{" "}
                  <a href="/terms" className="underline hover:text-[#4ade80] transition-colors">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy-policy"
                    className="underline hover:text-[#4ade80] transition-colors"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          </div>

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