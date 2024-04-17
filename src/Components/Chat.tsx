import "../assets/css/chat.css";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

export const Chat = () => {
  return (
    <div>
      <h1 className="text-center mb-2">Chat</h1>
      <MessageList />
      <ChatInput />
    </div>
  );
};
