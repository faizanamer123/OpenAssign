"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { downloadAssignmentFile, downloadSubmissionFile } from "@/utils/downloads";
import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  fileId: string;
  fileName?: string;
  fileType: "assignment" | "submission";
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
      } else {
        await downloadSubmissionFile(user.email, fileId);
      }
    } catch (error) {
      console.error("Download error:", error);
      alert(`Download failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      variant={variant}
      size={size}
      className={`${className} ${isDownloading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isDownloading ? (
        <>
          <span className="material-symbols-outlined animate-spin mr-2">downloading</span>
          Downloading...
        </>
      ) : (
        <>
          <span className="material-symbols-outlined mr-2">download</span>
          {fileName || "Download"}
        </>
      )}
    </Button>
  );
}
