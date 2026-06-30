'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface ChatMessage {
  user: string;
  message: string;
  type: String;
  to?: string;
  timestamp: string;
}

export interface ChatState {
  isConnected: boolean;
  isAuthenticated: boolean;
  currentUser: string;
  userCabang: string;
  userDivisi: string;
  registeredUsers: string[];
  messages: ChatMessage[];
  error: string | null;
  isLoading: boolean;
}
export interface userRequest {
  action: string;
  userName: string;
  password: string;
  sender: string;
  displayName: string;
  cabang: string;
  divisi: string;
  limit: number;
  roomCode: string;
  chatRequests: listChat[];
  chatRequest: listChat;
}
export interface listChat {
  content: string;
  roomCode: 'PUBLIC' | 'PRIVATE' | 'DIVISI' | 'CABANG' | 'SYSTEM';
  sendTo?: string;
  cabang: string;
  divisi: string;
  status?: string;
}

interface UseChat {
  state: ChatState;
  register: (username: string, password: string, cabang: string, divisi: string) => void;
  login: (action: string, username: string, password: string) => void;
  sendMessage: (message: string, type: 'PUBLIC' | 'PRIVATE' | 'DIVISI' | 'CABANG', to?: string) => void;
  getMessage: (action: string, roomCode: string, limit: number) => void;
  getRegisteredUsers: (users: string, limit: number) => void;
  logout: () => void;
  setChatHistory: (formattedHistory: any[]) => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws-chat';

export function useChat(): UseChat {
  const [state, setState] = useState<ChatState>({
    isConnected: false,
    isAuthenticated: false,
    currentUser: '',
    userCabang: '',
    userDivisi: '',
    registeredUsers: [],
    messages: [],
    error: null,
    isLoading: false,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  let isJsonHistory = false;
  let parsedData: any = null;

  const connectWebSocket = useCallback(() => {
    try {
      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          error: null,
        }));
      };

      wsRef.current.onmessage = (event: MessageEvent) => {
        const data = event.data;
        console.log('Received message:', data);
        if (data === '[REG_SUCCESS]') {
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, {
              user: 'SYSTEM',
              message: 'Registrasi berhasil! Silakan login.',
              type: 'SYSTEM',
              timestamp: new Date().toLocaleTimeString('id-ID'),
            }],
          }));
          return;
        }
        if (data === '[REG_FAILED]') {
          setState(prev => ({
            ...prev,
            error: 'Registrasi gagal. Username mungkin sudah digunakan.',
            messages: [...prev.messages, {
              user: 'SYSTEM',
              message: 'Registrasi gagal. Username mungkin sudah digunakan.',
              type: 'SYSTEM',
              timestamp: new Date().toLocaleTimeString('id-ID'),
            }],
          }));
          return;
        }

        if (data.startsWith('[LOGIN_SUCCESS]')) {
          const parts = data.split('|');
          const token = parts[1] || '';
          const cabang = parts[2] || '';
          const divisi = parts[3] || '';
          if (token) {
            localStorage.setItem('chat_token', token);
          }

          setState(prev => {
            const activeUser = prev.currentUser || 'User'; 
            return {
              ...prev,
              isAuthenticated: true, 
              token: token,
              userCabang: cabang,
              userDivisi: divisi,
              error: null,
              isLoading: false,
              messages: [...prev.messages, {
                user: 'SYSTEM',
                message: `Login berhasil! Selamat datang, ${activeUser}`,
                type: 'SYSTEM',
                timestamp: new Date().toLocaleTimeString('id-ID'),
              }],
            };
          });
          getMessage('GET_MESSAGE_GLOBAL', 'PUBLIC', 50);
          return;
        }

        if (data === '[LOGIN_FAILED]') {
          setState(prev => ({
            ...prev,
            error: 'Login gagal. Username atau password salah.',
            messages: [...prev.messages, {
              user: 'SYSTEM',
              message: 'Login gagal. Username atau password salah.',
              type: 'SYSTEM',
              timestamp: new Date().toLocaleTimeString('id-ID'),
            }],
          }));
          return;
        }
        if (data.startsWith('[USER_LIST]')) {
          console.log('FE Menerima data User List dari BE:', data);
          const parts = data.split('|');
          const rawUserList = parts[1] || ''; 
          const usersArray = rawUserList
            .split(',')
            .map((name: string ) => name.trim())
            .filter((name: string ) => name !== '');

          console.log('Hasil pemetaan Array Registered Users:', usersArray);

          setState(prev => ({
            ...prev,
            registeredUsers: usersArray 
          }));
          return;
        }
        if (data.trim().startsWith('[') || data.trim().startsWith('{')) {
          try {
            
            const parsedData = JSON.parse(data);
            console.log('Berhasil memparsing JSON History dari BE:', parsedData);

            const historyMessages = Array.isArray(parsedData) 
              ? parsedData 
              : (parsedData.messages || []);

            if (historyMessages.length > 0) {
              setState(prev => {
                const formattedHistory = historyMessages.map((msg: any) => ({
                  user: msg.user || 'SYSTEM',
                  message: msg.message || msg.text || '', 
                  type: msg.type || 'PUBLIC',
                  to: msg.to || '',
                  timestamp: msg.timestamp || new Date().toLocaleTimeString('id-ID'),
                }));

                return {
                  ...prev,
                  messages: [...prev.messages, ...formattedHistory]
                };
              });
            }
            return;
          } catch (jsonErr) {
            console.error('Gagal memproses data berformat JSON:', jsonErr);
          }
        }
        try {
          const lines = data.split('\n');
          if (lines.length >= 3) {
            const type = lines[0].trim();
            const user = lines[1].trim();
            const message = lines.slice(2).join('\n').trim();

            if (type && user && message) {
              setState(prev => ({
                ...prev,
                messages: [...prev.messages, {
                  user,
                  message,
                  type: (type as any) || 'PUBLIC',
                  timestamp: new Date().toLocaleTimeString('id-ID'),
                }],
              }));
            }
          }
        } catch (e) {
          console.log('Could not parse message:', data);
        }
      };

      wsRef.current.onerror = (error: Event) => {
        console.error('WebSocket error:', error);
        setState(prev => ({
          ...prev,
          error: 'Koneksi error. Mencoba reconnect...',
          isConnected: false,
        }));
      };
      

      wsRef.current.onclose = () => {
        setState(prev => ({
          ...prev,
          isConnected: false,
        }));
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setState(prev => ({
        ...prev,
        error: 'Gagal terhubung ke server.',
      }));
    }
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const register = useCallback((username: string, password: string, cabang: string, divisi: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setState(prev => ({ ...prev, isLoading: true }));
      const message = `[REGISTER]\n${username}\n${password}\n${cabang}\n${divisi}`;
      wsRef.current.send(message);
    }
  }, []);

  const login = useCallback((action: string, username: string, password: string) => {
    console.log(`Attempting to ${action} with username: ${username}`);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setState(prev => ({ ...prev, isLoading: true, currentUser: username }));
      const message = `{"action": "${action}", "userName": "${username}", "password": "${password}"}`;
      wsRef.current.send(message);
    }
  }, []);

  const getMessage = useCallback((action: string, roomCode: string, limit: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = `{"action": "${action}", "roomCode": "${roomCode}", "limit": ${limit}}`;
      wsRef.current.send(message);
      console.log(`Requesting messages with action: ${action}`);
      return message;
    }
  }, []);

  const sendMessage = useCallback((message: string, type: 'PUBLIC' | 'PRIVATE' | 'DIVISI' | 'CABANG', to?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && state.isAuthenticated) {
      console.log(`Sending message: ${message}, type: ${type}, to: ${to}`);
      const payloadChat: listChat = {
        content: message,
        roomCode: type, 
        sendTo: to || '',
        cabang: state.userCabang,
        divisi: state.userDivisi,
        status: 'SENT'
      };

      const requestBody: Partial<userRequest> = {
        action: "SEND_MESSAGE",
        userName: state.currentUser,
        roomCode: type,
        chatRequest: payloadChat
      };
      const jsonString = JSON.stringify(requestBody);
      wsRef.current.send(jsonString);

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          user: state.currentUser,
          message,
          type,
          to,
          timestamp: new Date().toLocaleTimeString('id-ID'),
          status: 'SENT'
        }],
      }));
    }
  }, [state.isAuthenticated, state.currentUser]);
  
  
  const getRegisteredUsers = useCallback((users: string, limit: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const requestBody: Partial<userRequest> = {
        action: "GET_REGISTERED_USERS",
        sender: state.currentUser,
        userName: users,
        limit: limit
      };
      const jsonString = JSON.stringify(requestBody);
      wsRef.current.send(jsonString);
    }
  }, [state.currentUser]);

  const logout = useCallback(() => {
    setState({
      isConnected: false,
      isAuthenticated: false,
      currentUser: '',
      userCabang: '',
      userDivisi: '',
      registeredUsers: [],
      messages: [],
      error: null,
      isLoading: false,
    });
  }, []);
  const setChatHistory = useCallback((formattedHistory: any[]) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, ...formattedHistory]
    }));
  }, []);

  return {
    state,
    register,
    login,
    getMessage,
    sendMessage,
    getRegisteredUsers,
    logout,
    setChatHistory
  };
}
