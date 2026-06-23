'use client';

import { useState } from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  onSendMessage: (message: string, type: 'PUBLIC' | 'PRIVATE' | 'DIVISI' | 'CABANG', to?: string) => void;
  isDisabled: boolean;
  // Tambahkan 2 props baru ini untuk menangkap info chat yang sedang aktif di layar
  activeChatType: 'PUBLIC' | 'PRIVATE' | 'DIVISI' | 'CABANG';
  activeChatTarget: string;
}

export function MessageInput({ onSendMessage, isDisabled, activeChatType, activeChatTarget }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isDisabled) return;

    // Otomatis menentukan parameter berdasarkan room chat yang aktif
    const type = activeChatType;
    const to = type === 'PRIVATE' ? activeChatTarget : undefined;

    onSendMessage(message.trim(), type, to);
    setMessage(''); // Bersihkan kolom input setelah kirim
  };

  return (
    <form onSubmit={handleSend} className="bg-zinc-100 border-t border-zinc-200 p-3 flex items-center gap-2 shadow-inner">
      
      {/* Tombol Dekorasi (Opsional: Seperti ikon Emoji di WA) */}
      <button 
        type="button" 
        className="text-zinc-500 hover:text-zinc-700 p-1 hidden sm:block"
        disabled={isDisabled}
      >
        <Smile className="w-5 h-5" />
      </button>

      {/* Kolom Tulis Pesan Utama */}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          activeChatType === 'PUBLIC' 
            ? "Tulis pesan ke Global Room..." 
            : `Tulis pesan ke ${activeChatTarget}...`
        }
        className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm shadow-sm"
        disabled={isDisabled}
      />

      {/* Tombol Kirim */}
      <Button
        type="submit"
        disabled={isDisabled || !message.trim()}
        className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 w-10 sm:w-auto sm:px-4 flex items-center justify-center transition-all shadow"
      >
        <Send className="w-4 h-4" />
        <span className="hidden sm:inline ml-2 text-sm font-semibold">Kirim</span>
      </Button>
    </form>
  );
}