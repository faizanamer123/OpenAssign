"use client";

import React, { useEffect, useRef, useState } from "react";

export default function CallRoom() {
  const [channelName, setChannelName] = useState("");
  const [userId, setUserId] = useState("");
  const [connected, setConnected] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Helper: send message to signaling server
  const sendMessage = (type: string, body: any) => {
    wsRef.current?.send(JSON.stringify({ type, body }));
  };

  const waitForStream = async () => {
    while (!localStreamRef.current) {
      await new Promise((res) => setTimeout(res, 200));
    }
    await createOffer();
  };

  // Handle WebSocket messages
  const handleMessage = async (event: MessageEvent) => {
    const { type, body } = JSON.parse(event.data);

    switch (type) {
      case "joined":
        if (body.length > 1) {
          await waitForStream();
        }
        break;

      case "offer_sdp_received":
        await handleOffer(body);
        break;

      case "answer_sdp_received":
        await handleAnswer(body);
        break;

      case "ice_candidate_received":
        await handleIceCandidate(body);
        break;
    }
  };

  const joinChannel = async () => {
    if (!channelName || !userId) return alert("Enter both channel and user ID");

    const socketUrl =
      process.env.NODE_ENV === "development"
        ? "ws://localhost:3000"
        : "wss://openassignserver.fly.dev";
    wsRef.current = new WebSocket(socketUrl);
    wsRef.current.onmessage = handleMessage;
    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
      sendMessage("join", { channelName, userId });
      setConnected(true);
    };

    const config = {
      iceServers: [
        {
          urls: [
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:global.stun.twilio.com:3478", // ✅ no ?transport=udp here
          ],
        },
      ],
    };
    pcRef.current = new RTCPeerConnection(config);
    pcRef.current.onicegatheringstatechange = () =>
      console.log("ICE state:", pcRef.current!.iceGatheringState);

    pcRef.current.addEventListener(
      "icecandidate",
      (e: RTCPeerConnectionIceEvent) => {
        console.log("icecandidate", e.candidate);
        if (e.candidate) {
          sendMessage("send_ice_candidate", {
            channelName,
            userId,
            candidate: e.candidate,
          });
        }
      }
    );

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStreamRef.current = localStream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }

    // add tracks to peer connection
    localStream.getTracks().forEach((track) => {
      pcRef.current!.addTrack(track, localStream);
    });

    pcRef.current.addEventListener("track", (e: RTCTrackEvent) => {
      console.log("track", e.track);
      remoteVideoRef.current!.srcObject = e.streams[0];
    });
  };

  // create and send offer
  const createOffer = async () => {
    const pc = pcRef.current!;
    const offer = await pc.createOffer();
    console.log("offer", offer);
    await pc.setLocalDescription(offer);

    sendMessage("send_offer", { channelName, userId, sdp: offer });
  };

  // handle offer from peer
  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    const remote = pcRef.current!;
    console.log("handle offer", offer);
    await remote.setRemoteDescription(offer);
    const answer = await remote.createAnswer();

    await remote.setLocalDescription(answer);

    sendMessage("send_answer", { channelName, userId, sdp: answer });
  };

  // handle answer
  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    console.log("handle answer");
    const remote = pcRef.current!;
    await remote.setRemoteDescription(new RTCSessionDescription(answer));
  };

  // handle ICE
  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    const pc = pcRef.current!;
    console.log("handle ice candidate", candidate);
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  };

  // clean up
  useEffect(() => {
    return () => {
      wsRef.current?.close();
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="flex flex-col items-center text-white bg-black min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-4">🎥 WebRTC One-to-One Call</h1>

      <div className="flex gap-4 mb-4">
        <input
          className="bg-gray-800 p-2 rounded text-white"
          placeholder="Channel Name"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
        />
        <input
          className="bg-gray-800 p-2 rounded text-white"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          onClick={joinChannel}
          disabled={connected}
        >
          {connected ? "Connected" : "Join"}
        </button>
      </div>

      <div className="flex gap-6 justify-center">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-1/3 bg-gray-900 rounded-lg"
        ></video>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-1/3 bg-gray-900 rounded-lg border-2 border-green-500"
          onLoadedMetadata={() =>
            console.log("📹 Remote video metadata loaded")
          }
          onPlay={() => console.log("▶️ Remote video playing")}
        ></video>
      </div>
    </div>
  );
}
