"use-client";
import { useState, useRef, useEffect } from "react";

export type VideoHookModel = {
  channelName: string;
  userId: string;
  connected: boolean;
  showDropDown: boolean;
  roomIdInput: string;
  offerFlag: boolean;
  handleOfferBody: RTCSessionDescriptionInit | undefined;
  createNewMeeting: () => Promise<void>;
  joinExistingMeeting: () => Promise<void>;
  copyRoomId: () => void;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  setRoomIdInput: (value: string) => void;
  setShowDropdown: (value: boolean) => void;
};

export const useVideoHook = (): VideoHookModel => {
  const [channelName, setChannelName] = useState("");
  const [userId, setUserId] = useState("");
  const [connected, setConnected] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState("");
  const [offerFlag, setOfferFlag] = useState<boolean>(false);
  const [handleOfferBody, sethandleOfferBody] =
    useState<RTCSessionDescriptionInit>();
  const [isRemoteSDP, setRemoteSDP] = useState<boolean>(false);
  const [ice_candidate, setICECandidate] = useState<RTCIceCandidateInit>();

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

  useEffect(() => {
    if (isRemoteSDP && ice_candidate) {
      pcRef.current!.addIceCandidate(new RTCIceCandidate(ice_candidate));
    }
  }, [ice_candidate, isRemoteSDP]);

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
    setRemoteSDP(true);
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
    setRemoteSDP(true);
  };

  const handleIceCandidate = (candidate: RTCIceCandidateInit) => {
    setICECandidate(candidate);
  };

  const copyRoomId = () => {
    if (channelName) {
      navigator.clipboard.writeText(channelName);
    }
  };

  return {
    channelName,
    userId,
    connected,
    showDropDown: showDropdown,
    roomIdInput,
    offerFlag,
    handleOfferBody,
    createNewMeeting,
    joinExistingMeeting,
    copyRoomId,
    localStream,
    remoteStream,
    setRoomIdInput,
    setShowDropdown,
  };
};

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
