import { useState } from "react";
import "../assets/css/chat.css";
import { useSocket } from "../providers/SocketProvider";

export const ChatInput = () => {
  const [message, setMessage] = useState("");
  const socket = useSocket();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  return (
    <form
      className="form"
      onSubmit={(event) => {
        event.preventDefault();
        socket.send({ type: "chat-message", content: message });
        setMessage("");
      }}
    >
      <input type="text" value={message} onChange={handleChange} />
      <input type="submit" />
    </form>
  );
};
