# Architecture Overview - Enterprise Chat Application

## Component Hierarchy

```
App (app/page.tsx)
│
├── useChat Hook (custom React hook)
│   ├── WebSocket management
│   ├── State management
│   ├── Event handling
│   └── Auto-reconnect logic
│
└── Main Layout (h-screen flex flex-col)
    │
    ├── ConnectionStatus Component
    │   ├── Connection indicator
    │   ├── User info display
    │   └── Logout button
    │
    └── Content Area (flex-1 overflow-hidden)
        │
        ├── AuthBox Component (if not authenticated)
        │   ├── AuthBox Form
        │   ├── Login Mode
        │   │   ├── Username input
        │   │   ├── Password input
        │   │   └── Login button
        │   │
        │   └── Register Mode
        │       ├── Username input
        │       ├── Password input
        │       ├── Cabang input
        │       ├── Divisi input
        │       └── Register button
        │
        └── ChatArea Component (if authenticated)
            │
            ├── MessageList Component
            │   ├── Message Container (flex-1 overflow-y-auto)
            │   │   ├── Message Item (for each message)
            │   │   │   ├── User name
            │   │   │   ├── Message type badge
            │   │   │   ├── Message content
            │   │   │   └── Timestamp
            │   │   │
            │   │   └── Scroll ref (auto-scroll to bottom)
            │   │
            │   └── Empty state (if no messages)
            │
            └── MessageInput Component
                ├── Message type selector
                │   ├── Publik button
                │   ├── Private button
                │   ├── Divisi button
                │   └── Cabang button
                │
                ├── Recipient input (if Private)
                │
                ├── Message input field
                │
                └── Send button
```

## Data Flow

### 1. Initialization

```
App mounts
  ↓
useChat hook initializes
  ↓
WebSocket connection starts
  ↓
Connection state updated
  ↓
UI renders with "Terputus" indicator
```

### 2. Registration Flow

```
User fills register form
  ↓
Clicks "Daftar"
  ↓
Form onSubmit triggered
  ↓
register() function called
  ↓
WebSocket sends: [REGISTER]\nusername\npassword\ncabang\ndivisi
  ↓
Server processes
  ↓
WebSocket receives: [REG_SUCCESS] or [REG_FAILED]
  ↓
State updated with message
  ↓
UI displays success/error
```

### 3. Login Flow

```
User fills login form
  ↓
Clicks "Masuk"
  ↓
Form onSubmit triggered
  ↓
login() function called
  ↓
WebSocket sends: [LOGIN]\nusername\npassword
  ↓
Server processes & validates
  ↓
WebSocket receives: [LOGIN_SUCCESS]|cabang|divisi
  ↓
State updated:
  - isAuthenticated = true
  - currentUser = username
  - userCabang = cabang
  - userDivisi = divisi
  ↓
UI switches from AuthBox to ChatArea
```

### 4. Messaging Flow

```
User types message
  ↓
Selects message type (PUBLIC/PRIVATE/DIVISI/CABANG)
  ↓
If PRIVATE: enters recipient username
  ↓
Clicks "Kirim"
  ↓
sendMessage() triggered
  ↓
Builds message: [TYPE]\nusername\nmessage\n[to]
  ↓
WebSocket sends message
  ↓
Message added to local state immediately
  ↓
UI updates with new message
  ↓
Auto-scroll to bottom
  ↓
Meanwhile: Server routes to recipients
  ↓
Recipients receive via WebSocket
  ↓
Their UI displays message
```

### 5. Disconnection & Reconnection

```
WebSocket connection lost
  ↓
onclose event triggered
  ↓
isConnected state = false
  ↓
UI shows "Terputus"
  ↓
setTimeout(3000ms) schedules reconnect
  ↓
connectWebSocket() called again
  ↓
New WebSocket created
  ↓
onopen event triggered
  ↓
isConnected state = true
  ↓
UI shows connection restored
  ↓
Send any queued messages
```

## State Management

### useChat Hook State

```typescript
{
  isConnected: boolean          // WebSocket connected
  isAuthenticated: boolean      // User logged in
  currentUser: string           // Username
  userCabang: string            // User's branch
  userDivisi: string            // User's division
  messages: ChatMessage[]       // All messages
  error: string | null          // Error message
  isLoading: boolean            // Sending/receiving
}
```

### ChatMessage Type

```typescript
{
  user: string                  // Sender username
  message: string               // Message content
  type: string                  // PUBLIC|PRIVATE|DIVISI|CABANG|SYSTEM
  to?: string                   // Recipient (for PRIVATE)
  timestamp: string             // HH:MM:SS format
}
```

## Component Communication

### Via Props

```
Page
  ├─→ AuthBox (onRegister, onLogin, isLoading, error)
  ├─→ ChatArea (messages, currentUser, onSendMessage)
  ├─→ ConnectionStatus (isConnected, isAuthenticated, currentUser, userCabang, userDivisi, onLogout)
  │
  └─→ ChatArea
      ├─→ MessageList (messages, currentUser)
      └─→ MessageInput (onSendMessage, isDisabled)
```

### Via WebSocket Events

```
Server
  ↓
WebSocket Message Event
  ↓
useChat onmessage handler
  ↓
Parse message
  ↓
Update state
  ↓
React re-render
  ↓
UI updates
```

## Theme System

### Semantic Design Tokens (globals.css)

```css
Colors:
  --background      /* Page background */
  --foreground      /* Text color */
  --primary         /* Main action color */
  --secondary       /* Card background */
  --muted           /* Disabled/subtle */
  --accent          /* Highlights */
  --destructive     /* Error/delete */
  --border          /* Dividers */
  --input           /* Form fields */

Sizes:
  --radius          /* Border radius */
  --radius-sm/md/lg /* Size variants */
```

### Color Values (Dark Theme)

```
Background:  oklch(0.11 0 0)        /* Deep blue-gray #1c2434 */
Primary:     oklch(0.51 0.216 259.6) /* Purple #8167db */
Secondary:   oklch(0.19 0 0)        /* Slightly lighter bg */
Foreground:  oklch(0.95 0.01 0)     /* Off-white #f2f7ff */
Destructive: oklch(0.63 0.2 25)     /* Red #d84545 */
```

## Performance Considerations

### Rendering Optimizations

1. **No unnecessary re-renders**
   - deps array in hooks
   - memo components if needed
   - Local state for UI-only features

2. **Auto-scroll without layout thrashing**
   - useRef for scroll target
   - scrollIntoView with smooth behavior
   - No full component re-renders

3. **Message handling**
   - Append to array (no full sort)
   - In-memory storage (fast access)
   - No database queries

### Bundle Size

- ~150kb gzipped (estimated)
- No heavy dependencies
- Tree-shakeable components
- Dynamic imports ready

## WebSocket Protocol

### Message Format

```
[TYPE]\n
username\n
message\n
[optional: to_username]
```

### Server Responses

```
[REG_SUCCESS]
[REG_FAILED]
[LOGIN_SUCCESS]|cabang|divisi
[LOGIN_FAILED]
TYPE\nusername\nmessage
SYSTEM\nSYSTEM\nSystem message
```

### Message Types

- `PUBLIC` - All users
- `PRIVATE` - Specific user
- `DIVISI` - Division members
- `CABANG` - Branch members
- `SYSTEM` - Internal events

## Responsive Breakpoints

```
Mobile:   375px (iOS SE, Android small)
Tablet:   768px (iPad, Android tablet)
Desktop:  1920px (Standard monitor)

Tailwind prefixes used:
  (no prefix) - base styles
  sm:         - 640px+
  md:         - 768px+
  lg:         - 1024px+
```

## Error Handling

### WebSocket Errors

```
Connection Error
  ↓
onclose/onerror triggered
  ↓
isConnected = false
  ↓
error message set
  ↓
UI shows error
  ↓
Auto-reconnect after 3s
```

### Form Validation

```
User submits form
  ↓
Check required fields
  ↓
If empty: highlight field
  ↓
If invalid: show error
  ↓
Only enable button if valid
```

### Message Errors

```
Parse error on received message
  ↓
Try/catch catches it
  ↓
Log to console
  ↓
Skip malformed message
  ↓
Continue processing others
```

## Future Architecture

### Potential Improvements

1. **Add Redux/Zustand** for complex state
2. **Message DB** for persistence
3. **User profiles** with avatars
4. **Typing indicators** with debouncing
5. **Message search** with indexing
6. **File uploads** with progress
7. **Voice/video** integration
8. **Notification** system

### Scalability Considerations

1. **Message Virtualization**
   - Render only visible messages
   - 1000+ messages support

2. **User List Pagination**
   - Load users in chunks
   - 10k+ users support

3. **Caching Strategy**
   - Server-side message cache
   - Client-side message dedup
   - Offline support

4. **Database Schema**
   - Users table
   - Messages table
   - Relationships
   - Indexes

## Security Considerations

### Current Implementation

- WebSocket over `ws://` (dev)
- No CSRF tokens needed (WebSocket)
- Password sent plain (should use HTTPS in prod)
- No SQL injection (no DB queries)
- No XSS (React escapes content)

### Production Recommendations

1. **Use `wss://`** (secure WebSocket)
2. **Add authentication tokens** (JWT/OAuth)
3. **Validate on server** (all input)
4. **Rate limiting** on messages
5. **Message encryption** (end-to-end)
6. **HTTPS only** for all connections
7. **Content Security Policy** headers
8. **Input sanitization** (just in case)

## Testing Strategy

### Unit Tests (Recommended)

```
hooks/
  ├── useChat.test.ts (message parsing, state)

components/
  ├── AuthBox.test.tsx (form validation)
  ├── MessageList.test.tsx (rendering)
  └── MessageInput.test.tsx (type selection)
```

### Integration Tests (Recommended)

```
flows/
  ├── auth.flow.test.ts (register → login)
  ├── messaging.flow.test.ts (send → receive)
  └── disconnect.flow.test.ts (reconnection)
```

### E2E Tests (Recommended)

```
Using agent-browser:
  ├── Register new user
  ├── Login and send messages
  ├── Test all message types
  └── Test responsiveness
```

## Summary

The architecture is designed for:
- ✅ Clean separation of concerns
- ✅ Easy to understand and modify
- ✅ Responsive across all devices
- ✅ Performant for typical usage
- ✅ Production-ready with setup
- ✅ Scalable with proper DB backend
