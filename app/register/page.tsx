"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Mail,
  Loader2,
  ArrowRight,
  CheckCircle,
  PartyPopper,
  Lock,
  LogIn,
  Shield,
  Users,
  Eye,
  EyeOff,
  GraduationCap,
  Star,
  Trophy,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { sendOtpEmail } from "@/lib/sendOtpEmail";
import { checkEmailVerified, sendOTP, verifyOTP } from "@/utils/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

export default function Register() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { signInWithEmail } = useAuth();
  const router = useRouter();

  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address (e.g., name@example.com)");
    } else {
      setEmailError("");
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      setEmailError("Email is required");
      toast.error("Email Required", {
        description: "Please enter your email address",
      });
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address (must include @ and .)");
      toast.error("Invalid Email Format", {
        description: "Email must include @ and a domain (e.g., name@example.com)",
      });
      return;
    }

    setEmailError("");

    setSendingOtp(true);
    try {
      // Check if user is already verified
      const verified = await checkEmailVerified(email);
      setIsVerified(verified);
      if (verified) {
        await signInWithEmail(email);
        router.replace("/home");
        toast.success("Welcome back! 🎉", {
          description: "You've been signed in successfully.",
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
        toast.success("OTP Sent! 📧", {
          description: "Check your email for the verification code.",
        });
      } else {
        toast.error("Failed to send OTP", {
          description: result.error || "Please try again",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to send OTP. Please try again.",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Invalid OTP", {
        description: "Please enter the 6-digit code from your email",
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
          toast.success("Welcome! 🎉", {
            description: "You've been signed in successfully.",
          });
        }, 100);
      } else {
        toast.error("Invalid OTP", {
          description: result.error || "Please check the code and try again",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to verify OTP. Please try again.",
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
        toast.success("OTP Sent! 📧", {
          description: "Check your email for the verification code.",
        });
      } else {
        toast.error("Failed to resend OTP", {
          description: result.error || "Please try again",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to resend OTP. Please try again.",
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
      router.replace("/home");
      toast.success("Welcome to OpenAssign! 🎉", {
        description: "You've been signed in successfully. Let's get started!",
      });
    } catch (error) {
      toast.error("Oops! Something went wrong", {
        description: "Failed to sign in. Please try again.",
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
    <>
      {/* Mobile UI - Hidden on lg and above */}
      <div className="lg:hidden min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Purple Header Bar */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Image 
                  src="/OpenAssign.svg" 
                  alt="OpenAssign Logo" 
                  width={24} 
                  height={24}
                  className="w-6 h-6"
                />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white">Join OpenAssign</h1>
                <p className="text-purple-100 text-sm">
                  Secure • Anonymous • Rewarding
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to the Future of Assignment Help
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
              Join thousands of students in our anonymous, secure platform where
              you can get help with assignments or earn points by helping others.
              No personal information required - just your email!
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
              <div className="bg-purple-600/20 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold text-center mb-2">
                100% Anonymous
              </h3>
              <p className="text-gray-400 text-sm text-center">
                Your identity stays completely private. We generate unique
                usernames for everyone.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
              <div className="bg-purple-600/20 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold text-center mb-2">
                Community Driven
              </h3>
              <p className="text-gray-400 text-sm text-center">
                Help others and earn points. Build your reputation in our
                supportive community.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
              <div className="bg-purple-600/20 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                <Mail className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold text-center mb-2">
                Email Verification
              </h3>
              <p className="text-gray-400 text-sm text-center">
                Quick and secure email verification ensures quality and prevents
                spam.
              </p>
            </div>
          </div>
        </div>

        {/* Registration Card */}
        <div className="flex justify-center pb-16 px-4">
          <Card className="w-full max-w-md study-card shadow-2xl">
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
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="your.email@university.edu"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      required
                      className="h-12 border-[#4ade80]/30 bg-[#1a1a1f]/50 focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/20 transition-all text-white"
                    />
                    {emailError && (
                      <p className="text-sm text-red-400 flex items-center gap-1">
                        <span>⚠️</span>
                        {emailError}
                      </p>
                    )}
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
                      className="h-12 border-[#4ade80]/30 bg-[#1a1a1f]/50 focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/20 transition-all text-center text-lg font-mono text-white"
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
              {isVerified && !otpSent && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-[#4ade80] animate-spin mb-4" />
                  <p className="text-gray-300 text-center">Logging you in...</p>
                </div>
              )}
              <p className="text-xs text-gray-400 text-center mt-4">
                By continuing, you agree to our{" "}
                <a
                  href="/terms"
                  className="underline hover:text-[#4ade80] transition-colors"
                >
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
      </div>

      {/* Desktop UI - Hidden below lg - FIXED VERSION */}
      <div className="hidden lg:flex relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        {/* Left Pane: Authentication Forms - Fixed width and centered content */}
        <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-card/95 backdrop-blur-sm p-8 xl:p-12 2xl:p-16 shadow-2xl z-10 border-r border-border/50">
          <div className="w-full max-w-md flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Branding Header with SVG Logo */}
            <div className="flex items-center gap-3 mb-4 group">
              <div className="flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-[#4ade80]/10 to-[#22c55e]/10 border border-[#4ade80]/20 shadow-lg transition-all group-hover:scale-105 group-hover:shadow-[#4ade80]/30">
                <Image 
                  src="/OpenAssign.svg" 
                  alt="OpenAssign Logo" 
                  width={57} 
                  height={57}
                  className="w-14 h-14 transition-transform group-hover:rotate-3"
                />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">OpenAssign</h2>
            </div>

            {/* Welcome Text */}
            <div className="flex flex-col gap-3 mb-4">
              <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                {otpSent ? "Verify Your Email" : "Welcome back"}
              </h1>
              <p className="text-muted-foreground text-base xl:text-lg leading-relaxed">
                {otpSent 
                  ? "Enter the 6-digit code sent to your email"
                  : "Join the top students reviewing and rating solutions."}
              </p>
            </div>

            {/* Form Content */}
            {!otpSent && !isVerified ? (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-foreground text-sm font-semibold flex items-center gap-2" htmlFor="email">
                    <Mail className="w-4 h-4 text-[#4ade80]" />
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Mail className="text-muted-foreground w-5 h-5 transition-colors group-focus-within:text-[#4ade80]" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="student@university.edu"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onBlur={() => {
                        if (email && !validateEmail(email)) {
                          setEmailError("Please enter a valid email address (must include @ and .)");
                        }
                      }}
                      className={`block w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-background/50 backdrop-blur-sm py-3.5 pl-11 pr-4 text-sm placeholder:text-muted-foreground/60 focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/20 focus:bg-background transition-all duration-200 ${
                        emailError ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                      }`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-sm text-red-400 flex items-center gap-2 mt-1 px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                      <span>⚠️</span>
                      {emailError}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSendOTP}
                  disabled={sendingOtp || !email}
                  className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-[#4ade80] to-[#22c55e] py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-[#4ade80]/25 transition-all duration-300 hover:from-[#22c55e] hover:to-[#16a34a] hover:shadow-xl hover:shadow-[#4ade80]/35 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </Button>
              </div>
            ) : null}

            {/* OTP Verification Step */}
            {otpSent && !isVerified && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex flex-col gap-3">
                  <label className="text-foreground text-sm font-semibold flex items-center gap-2" htmlFor="otp">
                    <Lock className="w-4 h-4 text-[#4ade80]" />
                    Verification Code
                  </label>
                  <div className="relative group">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Lock className="text-muted-foreground w-5 h-5 transition-colors group-focus-within:text-[#4ade80]" />
                    </div>
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      maxLength={6}
                      className="block w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-background/50 backdrop-blur-sm py-3.5 pl-11 pr-4 text-center text-xl font-mono tracking-widest focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/20 focus:bg-background transition-all duration-200"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-2 px-3 py-2 rounded-lg bg-muted/50">
                    Code sent to{" "}
                    <span className="font-semibold text-foreground">{email}</span>
                  </p>
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  disabled={verifyingOtp || otp.length !== 6}
                  className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-[#4ade80] to-[#22c55e] py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-[#4ade80]/25 transition-all duration-300 hover:from-[#22c55e] hover:to-[#16a34a] hover:shadow-xl hover:shadow-[#4ade80]/35 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {verifyingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Code
                      <CheckCircle className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm text-muted-foreground hover:text-foreground transition-all duration-200 px-3 py-2 rounded-lg hover:bg-muted/80 hover:scale-105 font-medium"
                  >
                    ← Back to email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={countdown > 0}
                    className="text-sm font-semibold text-[#4ade80] hover:text-[#22c55e] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg hover:bg-[#4ade80]/10 hover:scale-105 disabled:hover:scale-100"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                  </button>
                </div>
              </div>
            )}

            {/* If verified, show loading */}
            {isVerified && !otpSent && (
              <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#4ade80]/20 rounded-full blur-xl animate-pulse"></div>
                  <Loader2 className="h-12 w-12 text-[#4ade80] animate-spin mb-6 relative" />
                </div>
                <p className="text-muted-foreground text-center text-base font-medium">Logging you in...</p>
              </div>
            )}

            {/* Secure Badge */}
            <div className="mt-8 flex justify-center items-center gap-2 text-muted-foreground text-xs px-4 py-2.5 rounded-lg bg-muted/30 border border-border/50 backdrop-blur-sm">
              <Shield className="w-4 h-4 text-[#4ade80]" />
              <span className="font-medium">Secure, encrypted connection</span>
            </div>
          </div>
        </div>

        {/* Right Pane: Visual & Features - Improved responsiveness */}
        <div className="relative hidden w-0 flex-1 lg:flex lg:w-1/2 overflow-hidden">
          <div 
            className="absolute inset-0 h-full w-full transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url("sleek.png")`,
              backgroundSize: '110%',
              backgroundPosition: 'center 20%',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-[#22c55e]/60 to-[#4ade80]/20 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-[#4ade80]/20 mix-blend-color"></div>
          </div>

          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-20 w-72 h-72 bg-[#4ade80]/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-40 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          {/* Content overlay with better spacing */}
          <div className="absolute inset-0 flex flex-col justify-end pb-6 xl:pb-8 2xl:pb-12 px-8 xl:px-12 2xl:px-16 z-10">
            <div className="w-full max-w-xl 2xl:max-w-2xl mx-auto">
              {/* Testimonial Card */}
              <div className="relative rounded-2xl bg-white/8 backdrop-blur-md p-6 xl:p-8 2xl:p-10 border border-white/20 shadow-2xl mb-6 2xl:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 hover:bg-white/12 transition-all hover:border-white/30 group">
                <div className="absolute -top-5 -right-5 w-14 h-14 2xl:w-16 2xl:h-16 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border-2 border-[#22c55e]/30">
                  <Sparkles className="w-7 h-7 2xl:w-8 2xl:h-8 text-white drop-shadow-sm" />
                </div>
                <div className="flex flex-col gap-5 2xl:gap-6">
                  <div className="flex gap-1.5 2xl:gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-5 h-5 2xl:w-6 2xl:h-6 fill-[#22c55e] text-[#16a34a] opacity-90"
                        style={{
                          filter: 'drop-shadow(0 1px 2px rgba(34, 197, 94, 0.2)) brightness(1.1)'
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-lg xl:text-xl 2xl:text-2xl font-semibold leading-relaxed text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                    "OpenAssign helped me boost my grades by seeing how others solve problems. The leaderboard motivates me to keep improving!"
                  </p>
                  <div className="flex items-center gap-4 2xl:gap-5 pt-3 border-t border-white/20">
                    <div className="h-12 w-12 2xl:h-14 2xl:w-14 rounded-full bg-gradient-to-br from-white/25 to-white/8 flex items-center justify-center text-white font-bold text-base 2xl:text-lg shadow-lg ring-2 ring-white/15 backdrop-blur-sm">
                      JD
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-base 2xl:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Jane Doe</span>
                      <span className="text-white/90 text-sm 2xl:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Computer Science Student, Stanford</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom text */}
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                <div className="flex items-center gap-3 2xl:gap-4 mb-4">
                  <GraduationCap className="w-8 h-8 2xl:w-10 2xl:h-10 text-[#4ade80] drop-shadow-lg" />
                  <h3 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold text-white mb-2 drop-shadow-lg leading-tight">Master your assignments</h3>
                </div>
                <p className="text-base xl:text-lg 2xl:text-xl text-white/90 leading-relaxed drop-shadow-md">Join a community of students helping each other succeed through transparent reviews and collaborative learning.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}