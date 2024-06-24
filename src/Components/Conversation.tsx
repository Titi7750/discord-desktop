import { useEffect, useState } from 'react';

interface Conversation {
    id: number;
    title: string;
}

interface ConversationProps {
    onSelectConversation: (id: number) => void;
}

export const Conversation = ({ onSelectConversation }: ConversationProps) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await fetch('http://localhost:3001/conversations');
                const data: Conversation[] = await response.json();
                setConversations(data);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };

        fetchConversations();
    }, []);

    return (
        <div>
            <h1 className="text-center mb-2">Conversations</h1>
            <ul>
                {conversations.map(conversation => (
                    <li key={conversation.id}>
                        <a href="#" onClick={() => onSelectConversation(conversation.id)}>
                            {conversation.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};
