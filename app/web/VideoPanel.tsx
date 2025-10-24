import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

interface VideoPlayerProps {
  stream?: MediaStream | null;
  mirrored?: boolean;
  onLeave?: () => void;
}

const VideoPanel: React.FC<VideoPlayerProps> = ({
  stream,
  mirrored = false,
  onLeave,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleMic = () => {
    setMicEnabled((prev) => !prev);
    stream
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
  };

  const toggleCam = () => {
    setCamEnabled((prev) => !prev);
    stream
      ?.getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
  };

  return (
    <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${
          mirrored ? "scale-x-[-1]" : ""
        }`}
      />

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 px-5 py-3 rounded-full shadow-lg">
        <button
          onClick={toggleMic}
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
        >
          {micEnabled ? (
            <Mic size={22} className="text-white" />
          ) : (
            <MicOff size={22} className="text-red-500" />
          )}
        </button>

        <button
          onClick={toggleCam}
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
        >
          {camEnabled ? (
            <Video size={22} className="text-white" />
          ) : (
            <VideoOff size={22} className="text-red-500" />
          )}
        </button>

        <button
          onClick={onLeave}
          className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition"
        >
          <PhoneOff size={22} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default VideoPanel;
