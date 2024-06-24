import { useEffect, useState } from 'react';
import '../assets/css/message-list.css';
import { useSocket } from '../providers/SocketProvider';

interface MessageListProps {
    currentConversationId: number;
}

export type Message = {
    id: number;
    content: string;
    conversation_id: number;
    author: string;
    user_id: number;
};

export function MessageList({ currentConversationId }: MessageListProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const socket = useSocket();

    useEffect(() => {
        // Fetch messages from the database
        const fetchMessages = async () => {
            try {
                const response = await fetch(`http://localhost:3001/messages?conversation_id=${currentConversationId}`);
                const data = await response.json();
                setMessages(data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, [currentConversationId]);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (message: Message) => {
            if (message.conversation_id === currentConversationId) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }
        };

        const unsubscribe = socket.onMessage(handleMessage);
        return () => {
            unsubscribe();
        };
    }, [socket, currentConversationId]);

    return (
        <div>
            {messages.map((message) => (
                <p key={message.id}>
                    <strong>{message.author}: </strong>{message.content}
                </p>
            ))}
        </div>
    );
}
