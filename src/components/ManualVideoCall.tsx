import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";

const ManualVideoCall: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<Peer.Instance | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startCall = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(userStream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userStream;
        }

        const newPeer = new Peer({
          initiator: true,
          trickle: false,
          stream: userStream,
        });

        newPeer.on("signal", (data) => {
          console.log("SIGNAL DATA:", data);
          // Send this data to another peer via a signaling server
        });

        newPeer.on("stream", (incomingStream) => {
          console.log("Received remote stream:", incomingStream);
          setRemoteStream(incomingStream);

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = incomingStream;
          }
        });

        setPeer(newPeer);
      } catch (error) {
        console.error("Error getting user media:", error);
      }
    };

    startCall();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold">AI Video Call</h1>
      <div className="flex gap-4">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          className="w-1/2 rounded-lg border"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-1/2 rounded-lg border"
        />
      </div>
    </div>
  );
};

export default ManualVideoCall;
