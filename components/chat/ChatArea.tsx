'use client';

import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatMessage } from '@/hooks/useChat';

interface ChatAreaProps {
  messages: ChatMessage[];
  currentUser: string;
  onSendMessage: (message: string, type: 'PUBLIC' | 'PRIVATE' | 'DIVISI' | 'CABANG', to?: string) => void;
  isAuthenticated: boolean;
  activeChatType: 'PUBLIC' | 'PRIVATE' | 'DIVISI' | 'CABANG';
  activeChatTarget: string;
}

export function ChatArea({
  messages,
  currentUser,
  onSendMessage,
  isAuthenticated,
  activeChatType,
  activeChatTarget,
}: ChatAreaProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      <MessageList messages={messages} currentUser={currentUser} />
      
      {isAuthenticated && (
        <MessageInput 
          onSendMessage={onSendMessage} 
          isDisabled={false} 
          activeChatType={activeChatType}
          activeChatTarget={activeChatTarget}
        />
      )}
    </div>
  );
}