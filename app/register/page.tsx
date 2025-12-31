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

      {/* Desktop UI - Hidden below lg */}
      <div className="hidden lg:flex relative min-h-screen w-full flex-row overflow-hidden bg-background">
        {/* Left Pane: Authentication Forms */}
        <div className="flex w-full flex-col justify-center bg-card p-4 sm:p-8 lg:w-1/2 lg:p-12 xl:p-24 shadow-xl z-10">
          <div className="mx-auto w-full max-w-[480px] flex flex-col gap-3">
            {/* Branding Header with SVG Logo */}
            <div className="flex items-center">
              <div className="flex items-center justify-center">
                <Image 
                  src="/OpenAssign.svg" 
                  alt="OpenAssign Logo" 
                  width={50} 
                  height={50}
                  className="w-15 h-15"
                />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">OpenAssign</h2>
            </div>

            {/* Welcome Text */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {otpSent ? "Verify Your Email" : "Welcome back"}
              </h1>
              <p className="text-muted-foreground text-base">
                {otpSent 
                  ? "Enter the 6-digit code sent to your email"
                  : "Join the top students reviewing and rating solutions."}
              </p>
            </div>

            {/* Form Content */}
            {!otpSent && !isVerified ? (
              <div className="flex flex-col gap-5 mt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-foreground text-sm font-semibold" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="text-muted-foreground w-5 h-5" />
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
                      className={`block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-background py-3 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:border-[#4ade80] focus:ring-[#4ade80] focus:ring-1 ${
                        emailError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-sm text-red-400 flex items-center gap-1">
                      <span>⚠️</span>
                      {emailError}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSendOTP}
                  disabled={sendingOtp || !email}
                  className="group relative flex w-full justify-center rounded-xl bg-[#4ade80] py-3 px-4 text-sm font-bold text-white shadow-lg shadow-[#4ade80]/20 transition-all hover:bg-[#22c55e] hover:shadow-[#4ade80]/30 focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <LogIn className="text-lg" />
                      </span>
                      Send Verification Code
                    </>
                  )}
                </Button>
              </div>
            ) : null}

            {/* OTP Verification Step */}
            {otpSent && !isVerified && (
              <div className="flex flex-col gap-5 mt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-foreground text-sm font-semibold" htmlFor="otp">
                    Verification Code
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="text-muted-foreground w-5 h-5" />
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
                      className="block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-background py-3 pl-10 pr-3 text-center text-lg font-mono focus:border-[#4ade80] focus:ring-[#4ade80] focus:ring-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Code sent to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  disabled={verifyingOtp || otp.length !== 6}
                  className="group relative flex w-full justify-center rounded-xl bg-[#4ade80] py-3 px-4 text-sm font-bold text-white shadow-lg shadow-[#4ade80]/20 transition-all hover:bg-[#22c55e] hover:shadow-[#4ade80]/30 focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifyingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CheckCircle className="text-lg" />
                      </span>
                      Verify Code
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={countdown > 0}
                    className="text-sm font-semibold text-[#4ade80] hover:text-[#22c55e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                  </button>
                </div>
              </div>
            )}

            {/* If verified, show loading */}
            {isVerified && !otpSent && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-[#4ade80] animate-spin mb-4" />
                <p className="text-muted-foreground text-center">Logging you in...</p>
              </div>
            )}

            {/* Secure Badge */}
            <div className="mt-8 flex justify-center items-center gap-2 text-muted-foreground text-xs">
              <Lock className="text-sm" />
              <span>Secure, encrypted connection</span>
            </div>
          </div>
        </div>

        {/* Right Pane: Visual & Features */}
        <div className="relative hidden w-0 flex-1 lg:block">
          <div 
            className="absolute inset-0 h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: `url("sleek.png")`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent"></div>
            <div className="absolute inset-0 bg-[#4ade80]/10 mix-blend-multiply"></div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-12 xl:p-24 flex flex-col justify-end h-full">
            <div className="relative rounded-2xl bg-white/10 backdrop-blur-md p-8 border border-white/20 shadow-2xl max-w-lg">
              <div className="absolute -top-6 -right-6 size-12 bg-[#4ade80] rounded-full flex items-center justify-center text-white shadow-lg">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xl font-medium leading-relaxed text-white">
                  "OpenAssign helped me boost my grades by seeing how others solve problems. The leaderboard motivates me to keep improving!"
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                    JD
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">Jane Doe</span>
                    <span className="text-white/60 text-xs">Computer Science Student, Stanford</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 max-w-xl">
              <h3 className="text-3xl font-bold text-white mb-2">Master your assignments</h3>
              <p className="text-lg text-white/80">Join a community of students helping each other succeed through transparent reviews and collaborative learning.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}