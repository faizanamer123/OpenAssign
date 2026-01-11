"use client";
import {
  Loader2,
  ArrowRight,
  CheckCircle,
  Lock,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { sendOtpEmail } from "@/lib/sendOtpEmail";
import { checkEmailVerified, sendOTP, verifyOTP } from "@/utils/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
          subject: "AssignDump - Email Verification OTP",
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
          subject: "AssignDump - Email Verification OTP",
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
      toast.success("Welcome to AssignDump! 🎉", {
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
    <div className="bg-charcoal font-display min-h-screen flex overflow-hidden">
      {/* Desktop Left Pane - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden floating-library-bg border-r border-white/5">
        <div className="knowledge-core top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="light-trail-cyan w-full top-1/4 -rotate-12 opacity-50"></div>
        <div className="light-trail-emerald w-full bottom-1/4 rotate-6 opacity-40"></div>
        <div className="light-trail-cyan w-1/2 top-1/2 left-0 rotate-45 opacity-30"></div>
        <div className="absolute inset-0 z-0">
          <div className="glass-shelf w-48 h-2 top-[15%] left-[10%] -rotate-12"></div>
          <div className="glass-shelf w-64 h-2 top-[40%] left-[5%] rotate-3"></div>
          <div className="glass-shelf w-40 h-2 bottom-[20%] left-[15%] -rotate-6"></div>
          <div className="glass-shelf w-56 h-2 top-[25%] right-[10%] rotate-12"></div>
          <div className="glass-shelf w-72 h-2 bottom-[30%] right-[5%] -rotate-2"></div>
              </div>
        <div className="relative z-20 flex flex-col justify-between h-full w-full px-24 py-16">
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div className="glass-morphism px-6 py-3 rounded-full">
                <div className="flex items-center gap-3">
                  <div className="size-10 flex items-center justify-center rounded-lg backdrop-blur-lg bg-white/10 border border-white/20 relative group transition-all hover:bg-white/15">
                    <div className="absolute inset-0 bg-[#13ec92]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                    <span
                      className="material-symbols-outlined text-[#13ec92] text-2xl relative z-10"
                      style={{ fontVariationSettings: '"FILL" 1, "wght" 400' }}
                    >
                      diamond
                    </span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    Assign<span className="text-[#80e1e1]">Dump</span>
                  </span>
                </div>
              </div>
            </div>
            <h1 className="text-white text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Elevate your <br/><span className="bg-gradient-to-r from-[#10b981] to-[#06b6d4] bg-clip-text text-transparent">academic success.</span>
            </h1>
            <p className="text-white/60 text-xl max-w-lg font-light leading-relaxed">
              Connect with our advanced Academic Robot and unlock a world of cinematic learning and expert insights.
            </p>
          </div>
          <div className="relative flex-1 flex items-center justify-center py-10 scale-110">
            <div className="relative group flex items-center justify-center">
              <div className="absolute inset-0 bg-[#10b981]/20 rounded-full blur-[100px] scale-150 group-hover:bg-[#06b6d4]/20 transition-all duration-700"></div>
              <div className="relative z-10 w-96 h-96 flex items-center justify-center">
                <img 
                  alt="Academic Robot Cinematic Illustration" 
                  className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-1000" 
                  // src="https://lh3.googleusercontent.com/aida-public/AB6AXuDek5bSoiHsLpgzdSL-owQw_-tbI3xVpzgg_ihDZoL6fqFq7IeUWf3UaYX-BCw0C4ucp0PbK3e4D6rOmFw9xXX4yL2DuQAh7xsFRFL0td9eQAecyP4bxTcj5PHhsu2Tssj5msRUcxFRaxdf1tmKXQcHTobtl5cSnALav0Gywz5lLYz7FFdk-ISwPQsIsBW9xOeEw7QSegjL41Mtz-cwpAH4jGE83Uk0uYSrs7r6nqRAvb4oRLpM_kyiTvNwJUB4c7aCThIqNrfx1SQ"
                  src="AI_Academic_Focus.png"
                />
                <div className="absolute -bottom-4 -right-10 w-48 h-24 bg-white/5 border border-white/20 backdrop-blur-2xl rounded-2xl shadow-2xl flex flex-col p-4 rotate-[-6deg] group-hover:rotate-0 transition-all duration-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-2 rounded-full bg-[#10b981] animate-pulse"></div>
                    <span className="text-[10px] text-[#10b981] font-bold uppercase tracking-widest">Knowledge Core Active</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[75%] h-full bg-[#10b981]"></div>
                    </div>
                    <div className="w-2/3 h-1 bg-white/10 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                <div className="size-8 rounded-full border-2 border-charcoal bg-white/10"></div>
                <div className="size-8 rounded-full border-2 border-charcoal bg-white/20"></div>
                <div className="size-8 rounded-full border-2 border-charcoal bg-[#10b981]/30"></div>
              </div>
              <span className="text-white/40 text-sm font-medium tracking-wide">Trusted by 50k+ Scholars</span>
            </div>
            <p className="text-white/20 text-xs tracking-widest uppercase">System Version 4.0.2</p>
            </div>
          </div>
        </div>

      {/* Right Pane - Form Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-20 bg-charcoal relative">
        <div className="lg:hidden absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#10b981]/10 to-transparent"></div>
        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-16">
            <div className="glass-morphism px-6 py-3 rounded-full">
              <div className="flex items-center gap-3">
                <div className="size-10 flex items-center justify-center rounded-lg backdrop-blur-lg bg-white/10 border border-white/20 relative group transition-all hover:bg-white/15">
                  <div className="absolute inset-0 bg-[#13ec92]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                  <span
                    className="material-symbols-outlined text-[#13ec92] text-2xl relative z-10"
                    style={{ fontVariationSettings: '"FILL" 1, "wght" 400' }}
                  >
                    diamond
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Assign<span className="text-[#80e1e1]">Dump</span>
                </span>
              </div>
            </div>
          </div>
          <div className="mb-12">
            <h2 className="text-white text-4xl font-bold mb-3 tracking-tight">
              {otpSent ? "Verify Your Email" : isVerified ? "Welcome Back" : "Welcome Back"}
            </h2>
            <p className="text-white/40 text-lg font-light tracking-wide">
                {otpSent
                  ? "Enter the 6-digit code sent to your email"
                  : isVerified
                  ? "Your email is already verified. Logging you in..."
                : "Secure access to your academic portal"}
              </p>
            </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); }}>
            {!otpSent && !isVerified ? (
              <>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-[0.2em]" htmlFor="email">
                    Institutional Email
                  </label>
                  <div className="relative group">
                    <input
                      className="glass-input-premium"
                      id="email"
                      placeholder="name@university.edu"
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onBlur={() => {
                        if (email && !validateEmail(email)) {
                          setEmailError("Please enter a valid email address (must include @ and .)");
                        }
                      }}
                    />
                    <div className="absolute inset-y-0 right-5 flex items-center text-white/20 group-focus-within:text-[#10b981] transition-colors">
                      <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                    </div>
                  </div>
                  {emailError && (
                    <p className="text-sm text-red-400 mt-2">{emailError}</p>
                  )}
                </div>
                <button
                  className="w-full py-4.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-charcoal font-bold tracking-tight shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:shadow-[0_4px_30px_rgba(6,182,212,0.6)] hover:brightness-110 transition-all duration-500 active:scale-[0.98] relative overflow-hidden flex items-center justify-center gap-3 group"
                  type="button"
                  onClick={handleSendOTP}
                  disabled={sendingOtp || !email}
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-base">Sending...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">Continue to Dashboard</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </>
            ) : null}

            {otpSent && !isVerified && (
              <>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-[0.2em]" htmlFor="otp">
                    Verification Code
                  </label>
                  <div className="relative group">
                    <input
                      className="glass-input-premium text-center text-xl font-mono tracking-widest"
                      id="otp"
                      placeholder="000000"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                    />
                    <div className="absolute inset-y-0 right-5 flex items-center text-white/20 group-focus-within:text-[#10b981] transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-sm text-white/40 text-center mt-2">
                    Code sent to <span className="font-semibold text-white">{email}</span>
                  </p>
                </div>
                <button
                  className="w-full py-4.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-charcoal font-bold tracking-tight shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:shadow-[0_4px_30px_rgba(6,182,212,0.6)] hover:brightness-110 transition-all duration-500 active:scale-[0.98] relative overflow-hidden flex items-center justify-center gap-3 group"
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={verifyingOtp || otp.length !== 6}
                >
                  {verifyingOtp ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-base">Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">Verify Code</span>
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm text-white/40 hover:text-white transition-colors"
                  >
                    ← Back to email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={countdown > 0}
                    className="text-sm text-[#10b981] hover:text-[#06b6d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                  </button>
                </div>
              </>
            )}

            {isVerified && !otpSent && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-[#10b981] animate-spin mb-6" />
                <p className="text-white/40 text-center text-base font-medium">Logging you in...</p>
              </div>
            )}
          </form>

          <div className="relative my-12">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-6 bg-charcoal text-white/20 uppercase tracking-[0.3em] text-[10px] font-bold">Standard Auth</span>
          </div>
        </div>

          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <span className="material-symbols-outlined text-white/10 text-xl">security</span>
              <span className="material-symbols-outlined text-white/10 text-xl">verified_user</span>
              <span className="material-symbols-outlined text-white/10 text-xl">data_exploration</span>
            </div>
            <p className="text-white/20 text-[10px] uppercase tracking-[0.2em]">
              Protected by Advanced Neural Encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
