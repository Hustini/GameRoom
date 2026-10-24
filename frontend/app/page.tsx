"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// Event types shared with the server (could move to /shared later)
interface ServerToClientEvents {
  "chat message": (msg: string) => void;
}

interface ClientToServerEvents {
  "chat message": (msg: string) => void;
}

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:8080";

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const messagesRef = useRef<HTMLUListElement>(null);

  // Connect once, listen for incoming messages
  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
      io(SOCKET_URL);
    socketRef.current = socket;

    const onMessage = (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chat message", onMessage);

    return () => {
      socket.off("chat message", onMessage);
      socket.disconnect();
    };
  }, []);

  // Scroll to the bottom when a new message arrives
  useEffect(() => {
    const list = messagesRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = input.trim();
    if (!message) return;

    socketRef.current?.emit("chat message", message);
    setInput("");
  };

  return (
    <main className="m-0 p-5 font-[Arial,sans-serif]">
      <h1 className="mb-4 text-3xl font-bold">Simple Chat</h1>

      <ul
        ref={messagesRef}
        className="mb-5 h-[400px] list-none overflow-y-auto border border-[#ddd] p-2.5"
      >
        {messages.map((msg, i) => (
          <li
            key={i}
            className="border-b border-[#eee] px-4 py-2 last:border-b-0"
          >
            {msg}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="mt-2.5 flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoComplete="off"
          placeholder="Type your message..."
          className="flex-grow border border-gray-300 p-2.5 text-base"
        />
        <button
          type="submit"
          className="ml-2.5 cursor-pointer border-none bg-[#4CAF50] px-5 py-2.5 text-white hover:bg-[#45a049]"
        >
          Send
        </button>
      </form>
    </main>
  );
}