"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { downloadAssignmentFile, downloadSubmissionFile } from "@/utils/downloads";
import { downloadDatasetFile } from "@/utils/datasets";

interface DownloadButtonProps {
  fileId: string;
  fileName?: string;
  fileType: "assignment" | "submission" | "dataset";
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function DownloadButton({
  fileId,
  fileName,
  fileType,
  className = "",
  variant = "default",
  size = "default"
}: DownloadButtonProps) {
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!user?.email) {
      alert("Please sign in to download files");
      return;
    }

    setIsDownloading(true);
    
    try {
      if (fileType === "assignment") {
        await downloadAssignmentFile(user.email, fileId);
      } else if (fileType === "submission") {
        await downloadSubmissionFile(user.email, fileId);
      } else if (fileType === "dataset") {
        await downloadDatasetFile(user.email, fileId);
      }
    } catch (error) {
      console.error("Download error:", error);
      alert(`Download failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const baseClasses = "relative overflow-hidden group transition-all duration-300 hover-lift gpu-accelerated";
  
  const variants = {
    default: "glossy-pill px-6 py-3 text-sm font-black text-[#0a0f0d] rounded-full",
    outline: "px-6 py-3 bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/10 hover:border-primary/50 hover:text-primary hover:shadow-lg hover:shadow-primary/20",
    ghost: "px-6 py-3 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors",
    secondary: "px-6 py-3 bg-slate-700 text-white font-bold rounded-2xl hover:bg-slate-600 transition-colors"
  };

  const sizes = {
    default: "text-base",
    sm: "text-sm",
    lg: "text-lg",
    icon: "p-3"
  };

  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
    ${isDownloading ? "opacity-50 cursor-not-allowed" : ""}
  `;

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={buttonClasses}
    >
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isDownloading ? (
          <>
            <span className="material-symbols-outlined animate-spin">downloading</span>
            <span>Downloading...</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">download</span>
            <span>{fileName || "Download"}</span>
          </>
        )}
      </span>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-inherit bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
}
