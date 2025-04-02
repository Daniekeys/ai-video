import { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
// Supabase Configuration
export const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJzdWIiOiI2N2JlNmVjNjgzYzdjMGYyZTgzOTQzY2IiLCJpYXQiOjE3NDM1MDgwMTUsImV4cCI6MTc0MzU5NDQxNX0.BEQado2e1yQTe72gXVVqXWGVSyfLt4rvK8Zb-cGUqtk";

export default function VideoRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [recordingStopped, setRecordingStopped] = useState(false);
  const sessionId = Date.now(); // Unique ID for each session

  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      const socket = io(
        "https://peekpile-api.up.railway.app/talent?namespace=talent",
        {
          transports: ["websocket"],
          auth: { token: `${authToken}` },
        }
      );

      socket.on("connect", () => console.log("Socket connected successfully"));
      socket.on("connect_error", (error) =>
        console.error("Socket connection error:", error)
      );
      socket.on("video", (data) => console.log("Received video event:", data));

      socketRef.current = socket;
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [authToken]);

  const startRecording = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(userStream);
      setRecordingStopped(false);

      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }

      const recorder = new MediaRecorder(userStream, {
        mimeType: "video/webm",
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.readAsArrayBuffer(event.data);

          reader.onloadend = () => {
            socketRef.current?.emit("video", {
              fileBuffer: reader.result,
              fileExtension: "webm",
              sessionId,
            });
          };
        }
      };

      recorder.start(3000); // Capture data every 3 seconds
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setRecordingStopped(true);
    stream?.getTracks().forEach((track) => track.stop());
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-96 border rounded-lg"
      />

      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 text-white rounded-lg ${
          isRecording ? "bg-red-600" : "bg-blue-600"
        }`}
      >
        {isRecording ? "Stop Recording" : "Start Interview"}
      </button>

      {recordingStopped && (
        <button
          onClick={stopRecording}
          className="px-4 py-2 mt-2 bg-green-600 text-white rounded-lg"
        >
          End Interview
        </button>
      )}
    </div>
  );
}
