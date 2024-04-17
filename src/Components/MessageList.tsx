import { useEffect, useRef, useState } from "react";
import "../assets/css/chat.css";
import { useSocket } from "../providers/SocketProvider";

function Message({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function isChatEvent(
  event: unknown
): event is { type: "chat-message"; content: string } {
  return (
    typeof event === "object" &&
    event !== null &&
    "type" in event &&
    event["type"] === "chat-message"
  );
}

export const MessageList = () => {
  const [messages, setMessage] = useState([
    {
      id: 1,
      author: "John",
      content: "Hey, comment ça va ?",
    },
    {
      id: 2,
      author: "Jane",
      content: "Hey, bien et toi ?",
    },
  ]);
  const lastMessageRef = useRef(null);
  const socket = useSocket();

  useEffect(
    () =>
      socket.onMessage((message) => {
        if (!isChatEvent(message)) {
          return;
        }
        setMessage((messages) => [
          ...messages,
          { id: messages.length + 1, author: "Jane", content: message.content },
        ]);
      }),
    [socket]
  );

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="message-container">
      {messages.map((message, index) => (
        <div
          key={message.id}
          ref={index === messages.length - 1 ? lastMessageRef : null}
          className="containerMessage"
        >
          <Message key={message.id}>
            {message.author} : {message.content}
          </Message>
        </div>
      ))}
    </div>
  );
};
