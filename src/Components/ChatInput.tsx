import React, { useState } from 'react';
import '../assets/css/chat.css';
import { Message } from '../type/Message';

interface ChatInputProps {
  currentConversationId: number;
  onSend: (message: Message) => void;
}

export function ChatInput({ currentConversationId, onSend }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const userId = 1;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, content: message, conversation_id: currentConversationId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send message: ${errorText}`);
      }

      const messageContent: Message = await response.json();
      setMessage('');
      onSend(messageContent);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        value={message}
        onChange={(event) => setMessage(event.currentTarget.value)}
        placeholder="Your message"
        required
      />
      <button type="submit">Envoyer</button>
    </form>
  );
}
