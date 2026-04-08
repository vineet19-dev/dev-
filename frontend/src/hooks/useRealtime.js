import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export const useRealtime = (handlers) => {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"]
    });

    socket.on("connect_error", (error) => {
      console.error("Socket error", error.message);
    });

    socket.on("snapshot", (payload) => {
      handlersRef.current.onSnapshot?.(payload);
    });

    socket.on("system:update", (payload) => {
      handlersRef.current.onSystem?.(payload);
    });

    socket.on("alert:new", (payload) => {
      handlersRef.current.onAlert?.(payload);
    });

    socket.on("alert:resolved", (payload) => {
      handlersRef.current.onResolved?.(payload);
    });

    socket.on("log:new", (payload) => {
      handlersRef.current.onLog?.(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
};