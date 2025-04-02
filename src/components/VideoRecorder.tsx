import { createClient } from "@supabase/supabase-js";
import { useRef, useState } from "react";

// Supabase Configuration
const supabase = createClient(
  "https://xugmsgxmievjcjkstqrk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1Z21zZ3htaWV2amNqa3N0cXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2OTg1NTQsImV4cCI6MjA1NzI3NDU1NH0.EqVKihTVca-00jVBt0LJXE1pXou4ddeeLTTn8UfhQ04"
);

export default function VideoRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoChunks, setVideoChunks] = useState<Blob[]>([]);
  const [recordingStopped, setRecordingStopped] = useState(false);
  const sessionId = Date.now(); // Unique ID for each session
  const [videoUrl, setVideoUrl] = useState("");

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

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          setVideoChunks((prevChunks) => [...prevChunks, event.data]);
          await uploadChunk(event.data);
        }
      };

      recorder.start(3000); // Upload every 3 seconds
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopRecording = async () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setRecordingStopped(true);
    stream?.getTracks().forEach((track) => track.stop()); // Stop camera
  };

  const uploadChunk = async (chunk: Blob) => {
    const fileName = `videos/${sessionId}/${Date.now()}.webm`;

    const { error } = await supabase.storage
      .from("videos")
      .upload(fileName, chunk, {
        cacheControl: "3600",
        contentType: "video/webm",
      });

    if (error) {
      console.error("Upload error:", error);
    }
  };

const mergeVideoChunks = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/merge-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Merging successful:", data.videoUrl);

      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
      }
    } else {
      console.error("Failed to merge video:", await response.json());
    }
  } catch (error) {
    console.error("Error merging video:", error);
  }
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
          onClick={mergeVideoChunks}
          className="px-4 py-2 mt-2 bg-green-600 text-white rounded-lg"
        >
          End Interview
        </button>
      )}
      {videoUrl && (
        <video controls width="500">
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
