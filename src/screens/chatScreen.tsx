import { ChatInput } from '../Components/ChatInput';
import { MessageList } from '../Components/MessageList';
import '../assets/css/chat.css';

interface ChatScreenProps {
    conversationId: number;
}

export function ChatScreen({ conversationId }: ChatScreenProps) {
    return (
        <div className="chat-container">
            <MessageList currentConversationId={conversationId} />
            <ChatInput
                currentConversationId={conversationId}
                onSend={(message) => console.log('Message sent:', message)}
            />
        </div>
    );
}
