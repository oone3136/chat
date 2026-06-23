# Quick Start Guide - Enterprise Chat App

Panduan cepat untuk menjalankan aplikasi chat enterprise.

## 1. Installation (1 menit)

```bash
# Install dependencies
pnpm install

# Create .env.local (if not exists)
echo "NEXT_PUBLIC_WS_URL=ws://localhost:8080" > .env.local
```

## 2. Run Dev Server (30 detik)

```bash
# Start development server
pnpm dev

# Open browser
# Desktop: http://localhost:3000
# Mobile: Use same URL with device emulation
```

## 3. Test the App

### A. Register New User
1. Click **"Daftar di sini"**
2. Fill form:
   - Username: `john_doe`
   - Password: `password123`
   - Cabang: `Jakarta`
   - Divisi: `Marketing`
3. Click **"Daftar"**
4. Success message appears ✓

### B. Login
1. Back to login form
2. Enter credentials:
   - Username: `john_doe`
   - Password: `password123`
3. Click **"Masuk"**
4. Chat interface loads ✓

### C. Send Messages
1. **Choose message type** (buttons at top):
   - 🌍 **Publik** - Everyone sees it
   - 🔒 **Private** - Direct to user
   - 👥 **Divisi** - To division members
   - 🏢 **Cabang** - To branch members

2. **Type message** in input field
3. Click **"Kirim"** or press Enter
4. Message appears in chat ✓

## Important Setup

### WebSocket Server
The app requires a WebSocket server running at `ws://localhost:8080`.

Set in `.env.local`:
```
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

For production:
```
NEXT_PUBLIC_WS_URL=wss://your-server.com
```

## App Features

| Feature | Status | Notes |
|---------|--------|-------|
| Modern Dark Theme | ✅ Ready | Professional blue-gray colors |
| Responsive Design | ✅ Ready | Desktop, tablet, mobile |
| Real-time Chat | ✅ Ready | WebSocket powered |
| 4 Message Types | ✅ Ready | Public, Private, Divisi, Cabang |
| User Auth | ✅ Ready | Register & Login |
| Connection Status | ✅ Ready | Live indicator |
| Message History | ✅ Ready | In-memory during session |

## Responsive Testing

### Desktop (1920x1080)
```bash
agent-browser set viewport 1920 1080
```
- Full message cards
- Optimized layout
- All buttons visible

### Mobile (375x812)
```bash
agent-browser set viewport 375 812
```
- Full-width responsive
- Touch-friendly buttons
- Optimized typography

### Tablet (768x1024)
```bash
agent-browser set viewport 768 1024
```
- Balanced layout
- Medium text sizing
- Improved spacing

## Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Type checking
pnpm type-check
```

## Project Structure

```
app/
├── layout.tsx          # Dark theme setup
├── page.tsx            # Main chat page
└── globals.css         # Theme colors

components/
├── auth/AuthBox.tsx    # Login & Register
├── chat/
│   ├── ChatArea.tsx
│   ├── MessageList.tsx
│   └── MessageInput.tsx
└── common/
    └── ConnectionStatus.tsx

hooks/
└── useChat.ts          # WebSocket management
```

## Environment Variables

**`.env.local`**
```
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

- Change port if needed
- Use `wss://` for secure connection
- Change domain for production

## Troubleshooting

### "Koneksi error. Mencoba reconnect..."
- ❌ WebSocket server not running
- ✅ Fix: Start WebSocket server at `ws://localhost:8080`

### Messages not appearing
- ❌ Not logged in yet
- ✅ Fix: Complete login flow first

### Styling looks wrong
- ❌ Old cache
- ✅ Fix: Clear browser cache and reload

### Can't click buttons
- ❌ Form validation failing
- ✅ Fix: Check all required fields filled

## Production Deployment

### Vercel
1. Push to GitHub
2. Import to Vercel
3. Set env vars
4. Deploy ✓

### Self-Hosted
```bash
pnpm build
pnpm start
```

Then access at your domain.

## Next Steps

1. ✅ Run `pnpm dev`
2. ✅ Test app at `http://localhost:3000`
3. ✅ Try register & login
4. ✅ Send test messages
5. ✅ Test responsiveness
6. ✅ Deploy to production

## Support

For issues:
1. Check browser console (F12)
2. Check WebSocket connection
3. Verify `.env.local` is set
4. Clear cache and reload
5. Check README.md for detailed docs

---

**Happy chatting!** 🚀
