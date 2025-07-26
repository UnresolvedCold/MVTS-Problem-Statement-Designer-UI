import React, { useEffect, useState } from "react";

export default function WebSocketTest() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws");

    ws.onopen = () => {
      console.log("✅ Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      console.log("📩 Received from Java:", event.data);
      setMessages((prev) => [...prev, "Java: " + event.data]);
    };

    ws.onclose = () => {
      console.log("❌ Disconnected from server");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(input);
      setMessages((prev) => [...prev, "You: " + input]);
      setInput("");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>WebSocket Test</h2>
      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div style={{ marginTop: 20 }}>
        <h3>Messages:</h3>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
