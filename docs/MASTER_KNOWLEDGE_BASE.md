# Cloud-Base — Master Knowledge Base (MKB)

> **Purpose**: Ye document Vaibhav ke poore Cloud-Base project ka single source of truth hai.  
> Har architectural decision, encryption technique, design choice, infrastructure detail — sab yahan documented hai.  
> **Koi bhi naya agent ya session is document ko padhke bina Vaibhav se kuch pooche kaam shuru kar sakta hai.**

---

## Table of Contents
1. [Project Overview & Vision](#1-project-overview--vision)
2. [Monorepo Structure & File Map](#2-monorepo-structure--file-map)
3. [Infrastructure — Docker, Nginx & Networking](#3-infrastructure--docker-nginx--networking)
4. [Design Language & UI/UX Rules](#4-design-language--uiux-rules)
5. [Development Conventions & Code Patterns](#5-development-conventions--code-patterns)
6. [Authentication & SSO System](#6-authentication--sso-system)
7. [Encryption & Cryptography Architecture](#7-encryption--cryptography-architecture)
8. [Chat App — Complete Architecture](#8-chat-app--complete-architecture)
9. [Account Portal — Completed Features](#9-account-portal--completed-features)
10. [Admin Portal — Completed Features](#10-admin-portal--completed-features)
11. [User Portal — Planned Features](#11-user-portal--planned-features)
12. [Shared Packages](#12-shared-packages)
13. [Database Design (MongoDB)](#13-database-design-mongodb)
14. [Mobile App — Expo Migration Plan](#14-mobile-app--expo-migration-plan)
15. [Hard Rules — NEVER Break These](#15-hard-rules--never-break-these)

---

## 1. Project Overview & Vision

**Cloud-Base** ek personal cloud workspace ecosystem hai — Google suite jaisa but self-hosted aur privacy-first.

- **Tagline**: "Your personal cloud workspace"
- **Creator**: Vaibhav Senta
- **AI Partner**: Bella (CEO) — Hinglish tone, professional yet friendly
- **Architecture**: Multi-app subdomain-based monorepo
- **Target**: Web-first (PWA), future mobile app via Expo/React Native

### Apps Ecosystem
| App | Subdomain | Port | Purpose |
|-----|-----------|------|---------|
| User Portal | `localhost` (default) | 3000 | Main landing, app hub, service links |
| Account Portal | `account.localhost` | 3001 | Login, signup, profile, security, 2FA, sessions |
| Admin Portal | `admin.localhost` | 3002 | Admin dashboard, app management, logs, user management |
| Chat Portal | `chat.localhost` | 3001 (container) → 3003 (host) | Encrypted DM messaging |

### Backend Services
| Service | Port | Purpose |
|---------|------|---------|
| Account API | 5010 | Auth, users, sessions, 2FA, social login |
| Admin API | 5001 | Admin operations, app CRUD, logs |
| Chat API | 5006 | Chat profiles, messaging, WebSocket |
| Upload API | — | File upload handling |

---

## 2. Monorepo Structure & File Map

```
Cloud-Base/
├── .agents/AGENTS.md          # Project rules for AI agents
├── apps/
│   ├── account-portal/        # Next.js — Account management
│   ├── admin-portal/          # Next.js — Admin dashboard
│   ├── chat-portal/           # Next.js — Chat messenger
│   └── user-portal/           # Next.js — Main landing hub
├── services/
│   ├── account-api/           # Express.js — Auth & user management
│   ├── admin-api/             # Express.js — Admin operations
│   ├── chat-api/              # Express.js — Chat backend + WebSocket
│   └── upload-api/            # Express.js — File uploads
├── packages/
│   ├── schemaPackage/         # Shared MongoDB schemas
│   └── secure-query-cache/    # React Query encrypted cache wrapper
├── nginx/nginx.conf           # Subdomain reverse proxy config
├── docker-compose.yml         # Full orchestration
├── watchdog.sh                # Container health monitor
└── docs/                      # Documentation
```

---

## 3. Infrastructure — Docker, Nginx & Networking

### Docker Compose
- Sab services Docker me run hote hain via `docker-compose.yml`
- Volume mounts: Source code mounted for hot-reload development
- Node modules aur `.next` folders excluded from volume mount (container-local)
- Network: `cloudbase-net` bridge network — sab containers internally communicate

### Nginx Reverse Proxy
- Port 80 pe listen karta hai, subdomain-based routing:
  - `localhost` → `user-portal:3000`
  - `chat.localhost` → `chat-portal:3001`
  - `account.localhost` → `account-portal:3001`
  - `admin.localhost` → `admin-portal:3002`
- Production domains: `cloud-base.dev`, `chat.cloud-base.dev`, etc.

### Local Network Testing
- **IP**: `172.20.10.2` — ye IP sab jagah hardcoded hai for local network testing
- Docker containers ek doosre ko service name se call karte hain (e.g., `http://account-api:5010`)
- Frontend apps backend ko direct IP se call karte hain: `http://172.20.10.2:5010/api/v1/...`

---

## 4. Design Language & UI/UX Rules

### Color System
| Token | Value | Usage |
|-------|-------|-------|
| Background Primary | `#000000` | AMOLED pure black — base background |
| Accent Primary | `#0095f6` | Instagram Blue — buttons, highlights, active states |
| Accent Gradient | `linear-gradient(135deg, #00b0ff, #0095f6)` | Primary action buttons |
| Surface Cards | `#030303` to `#070707` | Card backgrounds |
| Border Default | `rgba(255, 255, 255, 0.05)` to `rgba(255, 255, 255, 0.08)` | Subtle borders |
| Border Light | `rgba(255, 255, 255, 0.15)` | Visible borders (user requested "halka white") |
| Text Primary | `#ffffff` | Main text |
| Text Secondary | `#555555` | Subtitles, hints |
| Text Muted | `#3f3f3f` to `#444444` | Placeholders, less important text |
| Error | `#ff453a` | Error states |

### Design Principles
- **AMOLED Black Base**: Pure `#000000` — no dark grays as base
- **Text-First / No-Icon Policy**: STRICTLY no icons, SVGs, or emojis in navigation or core UI unless Vaibhav explicitly requests
- **Premium Aesthetic**: Radial background glows, top gradient highlights, 2rem border-radius cards, micro-animations
- **Card Design**: `border-radius: 2rem`, subtle box-shadows with blue glow, `::before` top highlight line
- **Animations**: `cardEntrance` (translateY + opacity), `shake` (error feedback), cubic-bezier easing (`0.16, 1, 0.3, 1`)
- **Typography**: Uppercase subtitles (`letter-spacing: 0.06em`), tight heading tracking (`-0.04em`), bold weights (700-800)

### Responsive Strategy
- **Mobile-First Priority**: Always build Mobile layout first
- **Component Wrapper Pattern**: 
  ```
  Component/
  ├── Component.js          # Wrapper — detects width, renders platform variant
  ├── Mobile/
  │   └── ComponentMobile.js
  ├── Tablet/
  │   └── ComponentTablet.js (only if requested)
  └── Desktop/
      └── ComponentDesktop.js (only if requested)
  ```
- Breakpoints: Mobile < 600px, Tablet 600-1024px, Desktop > 1024px
- Width detection via `useWindowSize` custom hook

---

## 5. Development Conventions & Code Patterns

### CSS Strategy
- **CSS Modules only** — every component gets `.module.css` file
- **NO Tailwind CSS** in logic (it's installed but only for edge utility — don't use)
- All styles manually written by Vaibhav and Bella

### State Management
- **React Query** (`@tanstack/react-query`) for server state
- **Zustand** for client-side transient state (no persistence)
- **STRICTLY NO localStorage** — not for tokens, not for state, not for anything
- **Secure Query Cache**: Custom `secure-query-cache` package encrypts React Query cache data

### Framework & Stack
- **Frontend**: Next.js 16+ with `--webpack` flag (NOT turbopack, crashed on Alpine)
- **Backend**: Express.js on Node.js
- **Database**: MongoDB (Atlas cloud) + Mongoose ODM
- **Auth**: JWT tokens in HttpOnly cookies
- **Realtime**: Socket.io
- **Container Base**: `node:24-bookworm-slim` (Debian) — NOT Alpine (musl crashes native binaries)
- **PWA**: `next-pwa` configured for standalone mode

### Security Patterns
- All network requests to account-api use `securePost` — RSA+AES hybrid encryption
- Backend has `decryptRequest` middleware that decrypts incoming payloads
- Handshake flow: Client calls `/auth/handshake` → gets RSA public key + sessionId → encrypts AES key with RSA → sends encrypted payload

### Firebase
- Firebase is used for social authentication (Google login)
- Firebase config is in `.env.local` of each portal
- Project: `cloudbase-64fdc`

---

## 6. Authentication & SSO System

### Google-Style SSO (Implemented)
Vaibhav ne Google jaisa SSO flow design kiya hai:

**How it works:**
1. User visits `chat.localhost` → not logged in
2. Clicks "Login" → redirects to `account.localhost?redirect=http://chat.localhost/playground`
3. User logs in on `account.localhost` → JWT cookie set with `domain: 'localhost'`
4. `account.localhost` reads `?redirect` param → `window.location.href = redirect`
5. User lands back on `chat.localhost` → shared cookie detected → auto-authenticated

**Cookie Configuration (All cookies in account-api):**
```javascript
res.cookie('token', token, {
    httpOnly: true,
    secure: false,        // false for localhost dev
    sameSite: 'lax',
    path: '/',
    domain: 'localhost',  // CRITICAL — shared across all subdomains
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

**CORS Origins** (`account-api/.env.local`):
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost,http://chat.localhost,http://account.localhost,http://admin.localhost,https://tera-domain.com,http://172.20.10.2:3000
```

### Login Types
1. **Standard Login**: Email + Password → account-portal
2. **Partial Login (Bloom Filter)**: Email match in bloom filter → OTP-based login
3. **Social Login**: Google via Firebase
4. **2FA**: Email code or Authenticator app (TOTP)
5. **Instant Signup**: Quick signup inside chat-portal (no redirect needed for signup)

### Auth Middleware
- Cookie `token` extracted via `cookieParser`
- Fallback: `Authorization: Bearer <token>` header
- JWT decoded with `JWT_SECRET` = `CB_SUPER_SECRET_KEY_FOR_LOCAL_DEV`
- Payload: `{ userId, role, sessionId }`

---

## 7. Encryption & Cryptography Architecture

### Network Layer Encryption (Client ↔ Server)
```
Client                          Server (account-api)
  |                                |
  |--- GET /auth/handshake ------->|  Server generates RSA keypair (1024-bit forge)
  |<-- { publicKey, sessionId } ---|  Returns public key + sessionId
  |                                |
  |  Client generates random       |
  |  AES-256 key                   |
  |  Encrypts AES key with RSA     |
  |  Encrypts payload with AES     |
  |                                |
  |--- POST /auth/login ---------->|  Sends: { encryptedKey, encryptedData, iv, sessionId }
  |                                |  Server decrypts AES key with RSA private key
  |                                |  Server decrypts payload with AES key
  |<-- { token, user } ------------|  Returns JWT + user data
```

**Key Files:**
- Client: `chat-portal/src/utils/security/sessionKeys.js` — handshake logic
- Client: `chat-portal/src/utils/security/networkCrypto.js` — RSA+AES encryption
- Server: `account-api/src/common/utils/encryptionService.js` — RSA keypair + AES decryption
- Server: `account-api/src/common/middlewares/decryptRequest.js` — middleware

### Chat Layer Encryption (User ↔ User) — PLANNED (Phase 3)

**Double Encryption Model:**
- **Layer 1 (Client-to-Client)**: Message content encrypted with per-conversation AES-256 key
- **Layer 2 (Client-to-Server)**: Entire encrypted package re-encrypted with server tunnel key

**Key Rotation (Approach B — Device Entropy):**
- Every **2 minutes**, a new AES-256 key is generated per active conversation
- Key generation uses browser entropy: RAM, CPU cores, disk state, timestamp — mixed via SHA-256 + random salt
- **Active/Pending Key Buffer**: During rotation, `Active_AES_Key` handles current messages while `Pending_AES_Key` is exchanged in background
- **Envelope Packaging**: New AES key encrypted with receiver's RSA public key, sent via Socket.io status event
- Zero visible delay to users during rotation

**Key Storage:**
- Private keys stored ONLY in `window.__cb_chat_private_key` (memory — dies on tab close)
- Session tokens in `window.__cb_session_token`
- NEVER in localStorage, sessionStorage, or IndexedDB

---

## 8. Chat App — Complete Architecture

### Core Concept
- **MVP Scope**: One-to-One DMs only. Groups in later update.
- **Access**: Cloud-Base login mandatory. No guest access.
- **User Search**: Exact/full username match only — NO auto-suggestions or partial match (privacy)
- **Message Requests**: Instagram-style opt-in flow — User B must accept before chat activates
- **Profile Privacy**: All accounts default private. No follower system. Profile pic hidden until request accepted.

### Auth Flow in Chat Portal
1. **On Mount**: Check `/auth/me` via shared SSO cookie
2. **If authenticated**: Check if chat profile exists → if yes, proceed to chat
3. **If no chat profile**: Show username selection → generate RSA keypair → create profile
4. **If not authenticated — Login**: Redirect to `account.localhost?redirect=current_url`
5. **If not authenticated — Signup**: In-app instant signup form → then username selection

### Database Schema (MongoDB)
```
conversations:
  - conversationId (UUID)
  - participantA (user_id)
  - participantB (user_id)

messages:
  - messageId (client-generated UUID — deduplication)
  - conversationId
  - senderId
  - receiverId
  - encryptedPayload (server stores encrypted garbage — zero-knowledge)
  - status: "sent" | "delivered" | "read"
  - timestamp
```

### WebSocket (Socket.io)
- Engine: Socket.io (not raw WebSocket) — for auto-reconnect, rooms, heartbeat
- **Socket Auth**: JWT token encrypted with dynamic envelope encryption before passing in handshake query
- Backend decrypts → standard auth parsing
- Connection: `wss://` in production, `ws://` in dev

### Message Delivery Status UX
| Status | Visual Indicator |
|--------|-----------------|
| **Sent** (not delivered) | Message bubble shifts LEFT from right margin. Returns to right on delivery |
| **Delivered** | 1px horizontal line appears above bubble (bubble-width wide, 1px gap) |
| **Read** | Normal state — no extra indicator (clean rest state) |
| **Send Failed** | Red dot focus indicator on the bubble |

### Typing Indicator
- Position: Just above keyboard input bar, right side
- Visual: **2 horizontal dots** with wave motion animation (NOT "Typing..." text)
- Debounced — fades out smoothly when user stops typing

### Online/Offline Status
- Permanent display in chat header (profile area) — next to username/profile picture

### Offline & Sync
- **Offline Messages**: Stored in `messages` collection with `'sent'` status, queued
- **Come Online**: Socket event triggers fetch → marks `'delivered'`
- **IndexedDB**: Browser-side persistent encrypted store for React Query cache
- **Deduplication**: Client-generated UUID `messageId` prevents duplicates

---

## 9. Account Portal — Completed Features

### Pages & Features
- **Login Page** (`/`): Standard login, partial login (bloom filter + OTP), social login (Google), 2FA verification
- **Dashboard** (`/dashboard`): User overview, navigation to sub-sections
- **Personal Info**: Edit profile, display name, email
- **Security Settings**: Password change, 2FA toggle (email/authenticator), session management
- **Connected Services**: Google account linking
- **Verify Email**: Post-email-change verification flow
- **Account Actions**: Deactivate, delete (3-day grace period), reactivate

### Technical Implementation
- Secure Query Cache (encrypted React Query)
- Lazy loading via `next/dynamic` for heavy panels
- `React.memo` + `useCallback` for performance
- Error Boundaries for crash isolation
- Image optimization via Next.js `Image` component
- Debounce hook prepared for future search inputs

---

## 10. Admin Portal — Completed Features

- Dashboard with stat cards (users, services)
- App management (CRUD for platform apps)
- App filters and search
- User management
- System logs viewer
- Profile settings
- Responsive: Desktop + Mobile layouts

---

## 11. User Portal — Planned Features

- Main landing page — service hub with quick access links
- Bottom navigation bar (text-only: Home, Chat, Vault, Account)
- Auth status check via React Query
- PWA configured
- Hybrid routing (Nginx + standalone mode detection)

---

## 12. Shared Packages

### `packages/secure-query-cache`
- Wraps React Query with AES encryption layer
- Encrypts cache data in memory before storage
- Exports: `useSecureQuery`, `useSecureQueryClient`, `SecureQueryProvider`
- Used by: account-portal

### `packages/schemaPackage`
- Shared MongoDB/Mongoose schemas across services
- Prevents schema duplication between account-api, admin-api, chat-api

---

## 13. Database Design (MongoDB)

### Database: `cloudbase` (MongoDB Atlas)

### Key Collections
- `users` — Main user accounts (auth, profile, sessions, 2FA, account status)
- `conversations` — Chat conversation metadata
- `messages` — Encrypted chat messages
- App management collections (admin-api)
- Log collections (admin-api)

---

## 14. Mobile App — Expo Migration Plan

### Strategy
- **Framework**: Expo (React Native) via Expo Go for development
- **Reuse**: Same backend APIs, same encryption logic, same auth flow
- **SSO**: Mobile app will authenticate via account-api, receive JWT token
- **Chat**: Same WebSocket infrastructure, same E2E encryption
- **Design**: Same AMOLED + Instagram Blue design language
- **Key Differences from Web**:
  - No CSS Modules → React Native StyleSheet
  - No Nginx → Direct API calls
  - No cookie-based auth → Token stored in secure memory/keychain
  - No subdomain routing → Single app with navigation stack

### What to Carry Over (Critical)
1. All encryption logic (RSA handshake, AES encryption, key rotation)
2. Auth flow (login, signup, 2FA, social login)
3. Chat architecture (Socket.io, message delivery states, typing indicators)
4. Design tokens (colors, spacing, typography weights)
5. API endpoint structure (`/api/v1/...`)
6. Component wrapper pattern (adapt for React Native platform detection)

---

## 15. Hard Rules — NEVER Break These

| Rule | Detail |
|------|--------|
| **No localStorage** | NEVER use localStorage for anything — tokens, state, cache |
| **No Icons** | Text-first design. No SVGs, no icon libraries, no emojis in core UI |
| **AMOLED Black** | Base background is always `#000000`, never dark gray |
| **CSS Modules** | All styles in `.module.css` files, no Tailwind in logic |
| **Mobile-First** | Build mobile layout FIRST, desktop only when requested |
| **Zero-Touch** | Never modify Vaibhav's manual CSS/HTML/logic changes without permission |
| **Network IP** | Use `172.20.10.2` for all local network testing |
| **Cookie Domain** | All auth cookies MUST have `domain: 'localhost'` for SSO |
| **Wrapper Pattern** | Components follow `Component.js` → `Mobile/`, `Tablet/`, `Desktop/` structure |
| **React Query** | All server state via React Query. No other state library for server data |
| **HttpOnly Cookies** | Tokens are HttpOnly, Secure(prod), SameSite=Lax |
| **Debian Containers** | Use `node:24-bookworm-slim`, NOT Alpine (musl crashes native binaries) |
| **Env Prompt** | Always tell Vaibhav when a new `.env` variable is added |
| **Bella Identity** | AI speaks as "Bella (CEO)" in Hinglish tone |

---

> **Note for Future Agents**: Is document ko padhne ke baad tumhe Vaibhav se kuch bhi re-explain karwane ki zaroorat nahi padni chahiye. Agar koi specific implementation detail chahiye toh source code padho — file paths upar diye hain. Vaibhav ka mental load mat badhao — ye project unki bahut mehnat ka result hai.
