"use client";

import React from "react";
// import VideoPanel from "./VideoPanel";
// import { useVideoHook } from "@/hooks/useVideoHook";

export default function CallRoom() {
  // const {
  //   channelName,
  //   userId,
  //   connected,
  //   showDropDown,
  //   roomIdInput,
  //   createNewMeeting,
  //   joinExistingMeeting,
  //   copyRoomId,
  //   localStream,
  //   remoteStream,
  //   setRoomIdInput,
  //   setShowDropdown,
  // } = useVideoHook();

  return (
    <div className="flex flex-col items-center text-white bg-black min-h-screen p-6">
      {/* Video call functionality commented out */}
      <h1 className="text-2xl font-bold mt-20">Web Video Call - Disabled</h1>
      
      {/* Top right join button with dropdown - COMMENTED OUT */}
      {/* <div className="absolute top-6 right-6">
        <div className="relative">
          <button
            className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-lg flex items-center gap-2"
            onClick={() => setShowDropdown(!showDropDown)}
            disabled={connected}
          >
            {connected ? "🟢 Connected" : "Join Meeting"}
          </button>

          Dropdown menu
          {showDropDown && !connected && (
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
      </div> */}

      {/* Show room ID when connected */}
      {/* {channelName && (
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
      )} */}

      {/* Video panels - COMMENTED OUT */}
      {/* <div className="relative flex justify-center items-center w-full h-[80vh] mt-10">
        Remote (main video)
        <div className="rounded-2xl overflow-hidden border-4 border-green-600 shadow-2xl w-[80%] h-full">
          <VideoPanel
            stream={remoteStream}
            mirrored={false}
            onLeave={() => console.log("Left call")}
          />
        </div>

        Local (small preview)
        <div className="absolute bottom-6 right-6 w-[300px] h-[200px] rounded-lg overflow-hidden border-4 border-red-600 shadow-lg">
          <VideoPanel
            stream={localStream}
            mirrored={true}
            onLeave={() => console.log("Left call")}
          />
        </div>
      </div> */}
    </div>
  );
}
