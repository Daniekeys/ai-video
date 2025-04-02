import { useState } from "react";
// import VideoCall from "./components/VideoCall";
import AudioProcessing from "./components/AudioProcessing";
import AIResponse from "./components/AiResponse";
// import ManualVideoCall from "./components/ManualVideoCall";
import VideoRecorder from "./components/VideoRecorder";

export default function App() {
  const [userText, setUserText] = useState("");
  console.log("User Text:", userText)

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">AI Interview App</h1>
      {/* <VideoCall /> */}
      {/* <ManualVideoCall /> */}
      <VideoRecorder />
      <AudioProcessing onText={setUserText} />
      <p className="text-white">
        {userText}
      </p>
      <AIResponse userText={userText} />
    </main>
  );
}
