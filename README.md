# Enterprise Chat Application

Aplikasi chat enterprise modern yang responsif untuk desktop dan mobile dengan teknologi WebSocket real-time.

## Fitur Utama

- **Real-time Messaging**: Komunikasi instan menggunakan WebSocket
- **Responsive Design**: Bekerja sempurna di desktop, tablet, dan mobile
- **Message Types**: Dukung 4 jenis pesan:
  - **PUBLIC**: Pesan untuk semua pengguna
  - **PRIVATE**: Pesan ke pengguna spesifik
  - **DIVISI**: Pesan ke seluruh divisi
  - **CABANG**: Pesan ke seluruh cabang
- **Modern UI**: Dark theme dengan desain profesional
- **User Authentication**: Register dan login dengan username/password
- **User Information**: Tampil status koneksi, username, divisi, dan cabang

## Tech Stack

- **Framework**: Next.js 16 dengan React 19
- **UI**: shadcn/ui + Tailwind CSS v4
- **Real-time**: WebSocket native (no Socket.io)
- **Icons**: Lucide React
- **Styling**: Dark theme dengan semantic tokens

## Setup

### Prerequisites

- Node.js 18+ (atau pnpm v10+)
- WebSocket server running di `ws://localhost:8080`

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Setup environment variables (`.env.local`):
```
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

3. Start development server:
```bash
pnpm dev
```

4. Buka browser ke `http://localhost:3000`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `ws://localhost:8080` |

## Project Structure

```
app/
├── layout.tsx              # Root layout dengan dark theme
├── page.tsx                # Main page dengan chat UI
└── globals.css             # Theme colors & Tailwind config

components/
├── auth/
│   └── AuthBox.tsx         # Register & Login form
├── chat/
│   ├── ChatArea.tsx        # Main chat container
│   ├── MessageList.tsx     # Message display dengan styling
│   ├── MessageInput.tsx    # Input area dengan type selector
│   └── UserInfo.tsx        # User information display
└── common/
    └── ConnectionStatus.tsx # Connection indicator & user info

hooks/
└── useChat.ts              # WebSocket management & state handling

.env.local                  # Environment configuration
```

## Component Details

### AuthBox
- Register form dengan username, password, cabang, divisi
- Login form dengan username dan password
- Error handling dan loading states
- Mode toggle antara login dan register

### ChatArea
- Message list yang auto-scroll ke pesan terbaru
- Message input dengan type selector
- Support untuk private messages ke user tertentu
- Responsive layout untuk semua screen sizes

### MessageList
- Display messages dengan styling berbeda per type
- User avatar dan timestamp
- System messages untuk events (login, register)
- Auto-scroll to bottom

### MessageInput
- Quick select buttons untuk message types
- Input field untuk recipient (jika Private)
- Send button dengan validation
- Responsive button layout

### ConnectionStatus
- Real-time connection indicator
- Display user info (username, cabang, divisi)
- Logout button
- Network status visual feedback

## WebSocket Protocol

### Register
```
[REGISTER]
username
password
cabang
divisi
```

### Login
```
[LOGIN]
username
password
```

### Send Message
```
[TYPE]
username
message
[to_username]  (only for PRIVATE)
```

## Message Types Response

### Login Success
```
[LOGIN_SUCCESS]|cabang|divisi
```

### Message Receive
```
TYPE
username
message
```

## Usage

### Registration
1. Klik "Daftar di sini" di login form
2. Isi username, password, cabang, divisi
3. Klik "Daftar"
4. Setelah berhasil, kembali ke login

### Login
1. Masukkan username dan password
2. Klik "Masuk"
3. Jika login berhasil, tampil chat interface

### Sending Messages
1. Pilih message type (Publik, Private, Divisi, Cabang)
2. Jika Private, isi username penerima
3. Ketik pesan
4. Klik "Kirim" atau tekan Enter

## Responsive Design

- **Mobile** (375px): Full-width layout dengan optimized spacing
- **Tablet** (768px): Improved message width dan button sizing
- **Desktop** (1920px): Full featured layout dengan maximum content width

## Theme

Dark theme dengan color scheme:
- **Background**: Deep blue-gray (#1c2434)
- **Primary**: Purple accent (#8167db)
- **Secondary**: Slightly lighter background (#2a3f5f)
- **Foreground**: Off-white text (#f2f7ff)
- **Accent**: Purple with animation effects

## Performance

- Minimal re-renders dengan React hooks
- Efficient message handling di WebSocket hook
- Auto-scroll implemented dengan refs
- Responsive images dan optimized assets
- No unused dependencies

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- [ ] Emoji picker
- [ ] File upload support
- [ ] Message search/filter
- [ ] User presence indicators
- [ ] Typing indicators
- [ ] Message edit/delete
- [ ] Read receipts
- [ ] Call integration
- [ ] Audio/video messages

## Troubleshooting

### Connection Error: "Koneksi error. Mencoba reconnect..."
- Pastikan WebSocket server berjalan di `ws://localhost:8080`
- Check firewall dan browser console untuk error details

### Messages not sending
- Verifikasi sudah login berhasil (check connection status)
- Check message type dan recipient (jika Private)
- Lihat browser console untuk WebSocket errors

### Styling issues
- Clear browser cache dan reload
- Verify Tailwind CSS build properly
- Check if globals.css is correctly imported

## Development

### Running Dev Server
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

### Linting
```bash
pnpm lint
```

## License

Proprietary - Enterprise Chat System

## Support

For issues atau questions, hubungi development team.
