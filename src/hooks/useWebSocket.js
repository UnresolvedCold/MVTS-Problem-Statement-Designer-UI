// src/hooks/useWebSocket.js
import { useEffect, useRef, useCallback } from "react";
import { WEBSOCKET_CONFIG } from "../utils/constants";

export default function useWebSocket(onMessage) {
  const socketRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  
  // Get WebSocket configuration from environment variables or use defaults
  const port = process.env.REACT_APP_WEBSOCKET_PORT || WEBSOCKET_CONFIG.DEFAULT_PORT;
  const host = process.env.REACT_APP_WEBSOCKET_HOST || WEBSOCKET_CONFIG.DEFAULT_HOST;
  const protocol = process.env.REACT_APP_WEBSOCKET_PROTOCOL || WEBSOCKET_CONFIG.DEFAULT_PROTOCOL;
  const endpoint = WEBSOCKET_CONFIG.ENDPOINT;

  // Update the ref when onMessage changes
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const sendMessage = useCallback((msg) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("Sending message:", msg);
      socketRef.current.send(JSON.stringify(msg));
    } else {
      console.warn("WebSocket is not open. ReadyState:", socketRef.current?.readyState);
    }
  }, []);

  useEffect(() => {
    console.log(`Establishing WebSocket connection to ${protocol}://${host}:${port}${endpoint}...`);
    const socket = new WebSocket(`${protocol}://${host}:${port}${endpoint}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
      
      // Automatically request warehouse data after connection
      console.log("Requesting initial warehouse data...");
      if (socket.readyState === WebSocket.OPEN) {
        const message = {
          type: 'GET_WAREHOUSE_DATA'
        };
        console.log("Sending initial request:", message);
        socket.send(JSON.stringify(message));
      }
    };

    socket.onmessage = (event) => {
      try {
        console.log("Raw message received:", event.data);
        console.log("Type of received data:", typeof event.data);
        console.log("Length of received data:", event.data.length);
        
        // Check if the data is a string
        if (typeof event.data !== 'string') {
          console.error("Received non-string data:", event.data);
          return;
        }
        
        // Check if it's empty
        if (!event.data.trim()) {
          console.warn("Received empty message");
          return;
        }
        
        const data = JSON.parse(event.data);
        console.log("Parsed message from WebSocket server:", data);
        
        // Validate the parsed data structure
        if (typeof data === 'object' && data !== null) {
          onMessageRef.current(data);
        } else {
          console.error("Parsed data is not a valid object:", data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        console.error("Raw data that failed to parse:", event.data);
        console.error("First 100 characters:", event.data.substring(0, 100));
      }
    };

    socket.onclose = (event) => {
      console.log("Disconnected from WebSocket server. Code:", event.code, "Reason:", event.reason);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      console.log("Cleaning up WebSocket connection");
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [port, host, protocol, endpoint]);

  return { sendMessage };
}
