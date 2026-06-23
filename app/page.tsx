'use client';

import { useState, useCallback, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { AuthBox } from '@/components/auth/AuthBox';
import { ChatArea } from '@/components/chat/ChatArea';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';

export default function Page() {
  const { state, register, login, sendMessage, logout } = useChat();

  const [activeTab, setActiveTab] = useState<'GLOBAL' | 'GRUP' | 'PRIVATE'>('GLOBAL');
  const [activeChat, setActiveChat] = useState<{ type: 'PUBLIC' | 'PRIVATE' | 'DIVISI' | 'CABANG'; target: string }>({
    type: 'PUBLIC',
    target: 'GLOBAL',
  });
  const [mobileShowChat, setMobileShowChat] = useState<boolean>(false);
  useEffect(() => {
    if (state.registeredUsers.length > 0) {
      console.log('🔥 RE-RENDER DETECTED: Registered Users Berhasil Diperbarui:', state.registeredUsers);
    }
  }, [state.registeredUsers]);

  const getChatHistoryUsers = useCallback(() => {
    const privateMessages = state.messages.filter((m) => m.type === 'PRIVATE');
    const users = new Set<string>();

    privateMessages.forEach((m) => {
      if (m.user === state.currentUser && m.to) {
        const cleanTarget = m.to.replace(`${state.currentUser}_`, '').replace(`_${state.currentUser}`, '');
        users.add(cleanTarget !== 'PRIVATE' ? cleanTarget : m.to);
      }
      if (m.to && m.to.includes(state.currentUser)) {
        users.add(m.user);
      }
      if (m.user !== state.currentUser) {
        users.add(m.user);
      }
    });

    return Array.from(users).filter(u => u !== state.currentUser);
  }, [state.messages, state.currentUser]);

  const chatHistory = getChatHistoryUsers();

  const handleSelectChat = (type: 'PUBLIC' | 'PRIVATE' | 'DIVISI' | 'CABANG', target: string) => {
    setActiveChat({ type, target });
    setMobileShowChat(true); 
  };

  const filteredMessages = state.messages.filter((m) => {
    if (activeChat.type === 'PUBLIC' && m.type === 'PUBLIC') return true;
    if (activeChat.type === 'DIVISI' && m.type === 'DIVISI' && m.to === activeChat.target) return true;
    if (activeChat.type === 'CABANG' && m.type === 'CABANG' && m.to === activeChat.target) return true;
    if (activeChat.type === 'PRIVATE' && m.type === 'PRIVATE') {
      return m.user === activeChat.target || m.to?.includes(activeChat.target);
    }
    return false;
  });
  const generatePrivateRoomCode = (userA: string, userB: string) => {
    return userA.localeCompare(userB) < 0 ? `${userA}_${userB}` : `${userB}_${userA}`;
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <div className="flex items-center bg-card shadow-sm border-b border-border">
        {state.isAuthenticated && mobileShowChat && (
          <button
            onClick={() => setMobileShowChat(false)}
            className="md:hidden ml-4 px-3 py-1 bg-secondary text-secondary-foreground rounded-lg font-bold text-sm"
          >
            ← Kembali
          </button>
        )}
        <div className="flex-1">
          <ConnectionStatus
            isConnected={state.isConnected}
            isAuthenticated={state.isAuthenticated}
            currentUser={state.currentUser}
            userCabang={state.userCabang}
            userDivisi={state.userDivisi}
            onLogout={() => {
              logout();
              setMobileShowChat(false);
            }}
          />
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden w-full relative">
        {!state.isAuthenticated ? (
          <AuthBox
            onRegister={register}
            onLogin={login}
            isLoading={state.isLoading}
            error={state.error}
          />
        ) : (
          <>
            <div
              className={`w-full md:w-80 lg:w-96 bg-card border-r border-border flex flex-col justify-between 
                ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}
            >
              <div className="overflow-y-auto flex-1 p-3 space-y-3">
                {activeTab === 'GLOBAL' && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                      Public Room
                    </h3>
                    <div
                      className={`p-3 cursor-pointer rounded-xl flex items-center gap-3 transition-all
                        ${activeChat.type === 'PUBLIC' ? 'bg-primary/10 font-bold text-primary border border-primary/20' : 'hover:bg-secondary border border-transparent'}`}
                      onClick={() => handleSelectChat('PUBLIC', 'GLOBAL')}
                    >
                      <span className="text-xl">🌍</span>
                      <div>
                        <div className="text-sm">Global Chat Room</div>
                        <div className="text-xs text-muted-foreground font-normal">Semua divisi & cabang</div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'GRUP' && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                      Grup Kerja Anda
                    </h3>
                    <div
                      className={`p-3 cursor-pointer rounded-xl flex items-center gap-3 transition-all
                        ${activeChat.target === state.userDivisi ? 'bg-primary/10 font-bold text-primary border border-primary/20' : 'hover:bg-secondary border border-transparent'}`}
                      onClick={() => handleSelectChat('DIVISI', state.userDivisi)}
                    >
                      <span className="text-xl">👥</span>
                      <div>
                        <div className="text-sm">Divisi {state.userDivisi}</div>
                        <div className="text-xs text-muted-foreground font-normal">Obrolan internal tim</div>
                      </div>
                    </div>
                    <div
                      className={`p-3 cursor-pointer rounded-xl flex items-center gap-3 transition-all
                        ${activeChat.target === state.userCabang ? 'bg-primary/10 font-bold text-primary border border-primary/20' : 'hover:bg-secondary border border-transparent'}`}
                      onClick={() => handleSelectChat('CABANG', state.userCabang)}
                    >
                      <span className="text-xl">🏢</span>
                      <div>
                        <div className="text-sm">Cabang {state.userCabang}</div>
                        <div className="text-xs text-muted-foreground font-normal">Kordinasi regional</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'PRIVATE' && (
                  <div>
                    <div className="flex justify-between items-center px-2 mb-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Personal Chat
                      </h3>
                      <button
                        onClick={() => {
                          const inputNama = prompt("Masukkan username rekan kerja:");
                          console.log("Daftar terkini registeredUsers di State:", state.registeredUsers);
                          
                          if (inputNama) {
                            const nama = inputNama.trim(); 

                            if (state.registeredUsers.map(u => u.toLowerCase()).includes(nama.toLowerCase())) {
                              const roomCode = generatePrivateRoomCode(state.currentUser, nama);
                              handleSelectChat('PRIVATE', nama);
                            } else {
                              alert(`Username "${nama}" tidak terdaftar di cabang ${state.userCabang}!\n\nUser Terdaftar: ${state.registeredUsers.join(', ') || 'Kosong'}`);
                            }
                          }
                        }}
                        className="text-xs bg-primary hover:bg-primary/95 text-primary-foreground px-2 py-1 rounded-md font-medium"
                      >
                        + Chat Baru
                      </button>
                    </div>

                    <div className="space-y-1">
                      {chatHistory.length === 0 ? (
                        <div className="text-xs text-muted-foreground text-center py-8">
                          Belum ada riwayat pesan personal.
                        </div>
                      ) : (
                        chatHistory.map((username) => (
                          <div
                            key={username}
                            className={`p-3 cursor-pointer rounded-xl flex items-center gap-3 transition-all
                              ${activeChat.target === username ? 'bg-primary/10 font-bold text-primary border border-primary/20' : 'hover:bg-secondary border border-transparent'}`}
                            onClick={() => handleSelectChat('PRIVATE', username)}
                          >
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                              {username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm truncate">{username}</div>
                              <div className="text-xs text-muted-foreground font-normal truncate">
                                Klik untuk mengobrol
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border bg-muted/40 p-2 grid grid-cols-3 md:flex md:justify-around gap-1 shadow-inner">
                {(['GLOBAL', 'GRUP', 'PRIVATE'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 text-center text-xs font-bold rounded-lg transition-all md:flex-1
                      ${activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-secondary'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className={`flex-1 flex flex-col justify-between bg-zinc-50 ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
              <div className="bg-card px-4 py-3 border-b border-border shadow-sm text-sm font-semibold flex items-center gap-2">
                <span className="text-primary font-bold">[{activeChat.type}]</span>
                <span className="text-foreground">{activeChat.target}</span>
              </div>

              <div className="flex-1 overflow-hidden">
                <ChatArea
                  messages={filteredMessages}
                  currentUser={state.currentUser}
                  onSendMessage={(msg) => {
                    // 🟢 Jika private chat, parameter 'to' diisi Room Code agar dibaca akurat oleh ChatSocket Quarkus
                    const destination = activeChat.type === 'PRIVATE' 
                      ? generatePrivateRoomCode(state.currentUser, activeChat.target)
                      : activeChat.target;
                    sendMessage(msg, activeChat.type, destination);
                  }}
                  isAuthenticated={state.isAuthenticated}
                  activeChatType={activeChat.type}
                  activeChatTarget={activeChat.target}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}