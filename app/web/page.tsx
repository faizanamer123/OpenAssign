"use client";

import React, { useEffect, useRef, useState } from "react";
import VideoPanel from "./VideoPanel";

export default function CallRoom() {
  const [channelName, setChannelName] = useState("");
  const [userId, setUserId] = useState("");
  const [connected, setConnected] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState("");
  const [offerFlag, setOfferFlag] = useState<boolean>(false);
  const [handleOfferBody, sethandleOfferBody] =
    useState<RTCSessionDescriptionInit>();

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const sendMessage = (type: string, body: any) => {
    wsRef.current?.send(JSON.stringify({ type, body }));
  };

  useEffect(() => {
    if (!pcRef.current) {
      pcRef.current = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
              "stun:global.stun.twilio.com:3478", // ✅ no ?transport=udp here
            ],
          },
        ],
      });
    }
    pcRef.current.addEventListener(
      "icecandidate",
      (e: RTCPeerConnectionIceEvent) => {
        if (e.candidate) {
          sendMessage("send_ice_candidate", {
            channelName: channelName,
            userId: userId,
            candidate: e.candidate,
          });
        }
      }
    );
    pcRef.current.addEventListener("track", (e: RTCTrackEvent) => {
      setRemoteStream(e.streams[0]);
    });
  }, [channelName, userId]);

  useEffect(() => {
    if (offerFlag) {
      createOffer();
    }
  }, [offerFlag]);

  useEffect(() => {
    if (handleOfferBody) {
      handleOffer(handleOfferBody);
    }
  }, [handleOfferBody]);

  const createNewMeeting = async () => {
    const newRoomId = generateUniqueId();
    const newUserId = generateUniqueId();

    setChannelName(newRoomId);
    setUserId(newUserId);
    setShowDropdown(false);

    await joinChannelWithIds(newRoomId, newUserId);
  };

  const joinExistingMeeting = async () => {
    if (!roomIdInput.trim()) {
      throw Error("Room ID Not Provided....");
    }

    const newUserId = generateUniqueId();
    setChannelName(roomIdInput);
    setUserId(newUserId);
    setShowDropdown(false);

    await joinChannelWithIds(roomIdInput, newUserId);
  };

  const handleMessage = async (event: MessageEvent) => {
    const { type, body } = JSON.parse(event.data);

    switch (type) {
      case "joined":
        if (body.length > 1) setOfferFlag(true);
        break;
      case "offer_sdp_received":
        sethandleOfferBody(body);
        break;

      case "answer_sdp_received":
        await handleAnswer(body);
        break;

      case "ice_candidate_received":
        await handleIceCandidate(body);
        break;
    }
  };

  const joinChannelWithIds = async (
    roomId: string,
    userIdVal: string
  ): Promise<void> => {
    const isGranted = await generateLocalStream();
    if (!isGranted) return;
    const socketUrl =
      process.env.NODE_ENV === "development"
        ? "ws://localhost:3000"
        : "wss://openassignserver.fly.dev";
    wsRef.current = new WebSocket(socketUrl);
    wsRef.current.onmessage = handleMessage;
    wsRef.current.onopen = () => {
      sendMessage("join", { channelName: roomId, userId: userIdVal });
      setConnected(true);
    };
  };

  const generateLocalStream = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      if (pcRef.current) {
        stream.getTracks().forEach((track) => {
          pcRef.current!.addTrack(track, stream);
        });
      }

      return true; // success
    } catch (error) {
      return false; // failure
    }
  };

  const createOffer = async () => {
    const pc = pcRef.current!;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    sendMessage("send_offer", {
      channelName: channelName,
      userId: userId,
      sdp: offer,
    });
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    const remote = pcRef.current!;
    await remote.setRemoteDescription(offer);
    const answer = await remote.createAnswer();

    await remote.setLocalDescription(answer);
    sendMessage("send_answer", {
      channelName: channelName,
      userId: userId,
      sdp: answer,
    });
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    const remote = pcRef.current!;
    await remote.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    const pc = pcRef.current!;
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const copyRoomId = () => {
    if (channelName) {
      navigator.clipboard.writeText(channelName);
    }
  };

  return (
    <div className="flex flex-col items-center text-white bg-black min-h-screen p-6">
      {/* Top right join button with dropdown */}
      <div className="absolute top-6 right-6">
        <div className="relative">
          <button
            className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-lg flex items-center gap-2"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={connected}
          >
            {connected ? "🟢 Connected" : "Join Meeting"}
          </button>

          {/* Dropdown menu */}
          {showDropdown && !connected && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
              <div className="p-4">
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg mb-3 font-semibold"
                  onClick={createNewMeeting}
                >
                  🆕 Create New Meeting
                </button>

                <div className="border-t border-gray-700 pt-3">
                  <p className="text-sm text-gray-400 mb-2">
                    Or join existing:
                  </p>
                  <input
                    className="w-full bg-gray-900 p-3 rounded-lg text-white mb-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Paste Room ID"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && joinExistingMeeting()
                    }
                  />
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold"
                    onClick={joinExistingMeeting}
                  >
                    ↪️ Join Room
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Show room ID when connected */}
      {channelName && (
        <div className="bg-gray-800 px-6 py-3 rounded-lg mb-4 flex items-center gap-3">
          <span className="text-sm text-gray-400">Room ID:</span>
          <code className="bg-gray-900 px-3 py-1 rounded text-green-400 font-mono">
            {channelName}
          </code>
          <button
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
            onClick={copyRoomId}
          >
            📋 Copy
          </button>
        </div>
      )}

      <div className="relative flex justify-center items-center w-full h-[80vh] mt-10">
        {/* Remote (main video) */}
        <div className="rounded-2xl overflow-hidden border-4 border-green-600 shadow-2xl w-[80%] h-full">
          <VideoPanel
            stream={remoteStream}
            mirrored={false}
            onLeave={() => console.log("Left call")}
          />
        </div>

        {/* Local (small preview) */}
        <div className="absolute bottom-6 right-6 w-[200px] h-[150px] rounded-lg overflow-hidden border-4 border-red-600 shadow-lg">
          <VideoPanel
            stream={localStream}
            mirrored={true}
            onLeave={() => console.log("Left call")}
          />
        </div>
      </div>
    </div>
  );
}

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
