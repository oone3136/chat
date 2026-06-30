// hooks/getChat.ts

export interface QuarkusChatMessage {
  id: number;
  roomCode: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
  status: string;
}

export interface UIChatMessage {
  user: string;
  message: string;
  type: 'PUBLIC' | 'PRIVATE' | 'DIVISI' | 'CABANG' | 'SYSTEM';
  to: string;
  timestamp: string;
}

export async function getChatHistory(roomCode: string, limit: number = 50): Promise<UIChatMessage[]> {
  try {
    const response = await fetch(`http://localhost:8080/api/chat/list-public/${roomCode}/${limit}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: QuarkusChatMessage[] = await response.json();

    return data.map((msg) => {
      const formattedTime = msg.timestamp 
        ? new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      return {
        user: msg.sender,
        message: msg.content,
        type: msg.roomCode === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
        to: msg.recipient,
        timestamp: formattedTime
      };
    });
    
  } catch (error) {
    console.error("❌ Gagal menarik riwayat chat lewat HTTP:", error);
    return [];
  }
}