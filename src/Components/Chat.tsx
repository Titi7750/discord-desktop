import { useState } from "react";
import "../assets/css/chat.css";
import { ChatScreen } from "../screens/chatScreen";
import { Conversation } from "./Conversation";

export const Chat = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);

  return (
    <div>
      <div className="navLateralLeft">
        <Conversation onSelectConversation={(id) => setSelectedConversationId(id)} />
      </div>
      <h1 className="text-center mb-2">Chat</h1>
      {selectedConversationId && (
        <ChatScreen conversationId={selectedConversationId} />
      )}
    </div>
  );
};
