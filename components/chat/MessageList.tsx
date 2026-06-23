'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from '@/hooks/useChat';
import { Lock, Users, Globe, Info } from 'lucide-react';

interface MessageListProps {
  messages: ChatMessage[];
  currentUser: string;
}

const getMessageTypeIcon = (type: string) => {
  switch (type) {
    case 'PRIVATE':
      return <Lock className="w-3 h-3" />;
    case 'DIVISI':
      return <Users className="w-3 h-3" />;
    case 'CABANG':
      return <Users className="w-3 h-3" />;
    case 'SYSTEM':
      return <Info className="w-3 h-3" />;
    default:
      return <Globe className="w-3 h-3" />;
  }
};

const getMessageTypeColor = (type: string) => {
  switch (type) {
    case 'PRIVATE':
      return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    case 'DIVISI':
      return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    case 'CABANG':
      return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
    case 'SYSTEM':
      return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
    default:
      return 'bg-green-500/10 border-green-500/20 text-green-400';
  }
};

const getMessageTypeBadge = (type: string) => {
  switch (type) {
    case 'PRIVATE':
      return 'Private';
    case 'DIVISI':
      return 'Divisi';
    case 'CABANG':
      return 'Cabang';
    case 'SYSTEM':
      return 'Sistem';
    default:
      return 'Publik';
  }
};

export function MessageList({ messages, currentUser }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-4">
        <div>
          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground text-sm">
            Belum ada pesan. Mulai percakapan sekarang!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${msg.user === currentUser ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl px-4 py-2 rounded-lg ${
              msg.user === currentUser
                ? 'bg-primary text-white rounded-br-none'
                : 'bg-secondary text-foreground border border-border rounded-bl-none'
            }`}
          >
            {msg.user !== currentUser && msg.user !== 'SYSTEM' && (
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{msg.user}</span>
                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded border ${getMessageTypeColor(msg.type)}`}>
                  {getMessageTypeIcon(msg.type)}
                  {getMessageTypeBadge(msg.type)}
                </span>
              </div>
            )}

            {msg.type === 'SYSTEM' && (
              <div className="text-center py-2 text-xs text-muted-foreground italic">
                {msg.message}
              </div>
            )}

            {msg.type !== 'SYSTEM' && (
              <>
                <p className="text-sm break-words">{msg.message}</p>
                <p className={`text-xs mt-1 ${msg.user === currentUser ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {msg.timestamp}
                </p>
              </>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
