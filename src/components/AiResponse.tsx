import { useEffect, useState } from "react";

export default function AIResponse({ userText }: { userText: string }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!userText) return;

    const socket = new WebSocket("wss://your-ai-api.com/ws");

    socket.onopen = () => {
      socket.send(JSON.stringify({ text: userText }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setAudioUrl(data.audioUrl);
    };

    return () => socket.close();
  }, [userText]);

  return (
    <div>
      {audioUrl && (
        <audio controls autoPlay>
          <source src={audioUrl} type="audio/mpeg" />
        </audio>
      )}
    </div>
  );
}
