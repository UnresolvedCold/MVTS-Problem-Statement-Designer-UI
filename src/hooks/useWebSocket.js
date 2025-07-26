// src/hooks/useWebSocket.js
import { useEffect, useRef } from "react";

export default function useWebSocket(onMessage) {
  const socketRef = useRef(null);
  const port = process.env.REACT_APP_WEBSOCKET_PORT || 8080;

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:${port}/ws`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    return () => {
      socket.close();
    };
  }, [onMessage]);

  const sendMessage = (msg) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  };

  return { sendMessage };
}
