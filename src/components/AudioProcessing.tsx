import { useState } from "react";

export default function SpeechToText({
  onText,
}: {
  onText: (text: string) => void;
}) {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false; // Stops after one sentence
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onText(transcript); // Pass speech text to parent
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={startListening}
        disabled={isListening}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        {isListening ? "Listening..." : "Start Interview"}
      </button>
    </div>
  );
}
