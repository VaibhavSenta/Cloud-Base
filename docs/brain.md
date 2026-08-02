# Cloud-Base Agent Brain & Memory

This file serves as the persistent memory of the AI Agent (Antigravity). It contains critical context, status, rules, and memory logs to ensure context is never lost between sessions.

---

## 1. Core Project Context
- **Name**: Cloud-Base
- **Concept**: A premium "All-in-One" secure workspace (Identity/Account, Real-time Chat, Cloud Storage).
- **Core Design Language**: Zen-Luxury / Minimalist.
  - Theme: Pitch Black AMOLED (`#000000`)
  - Accent: Instagram Blue (`#0095f6`)
  - Typography: Text-first design, **strictly NO icons/emojis** (unless explicitly requested).
  - Wrapper Pattern: Dynamic component wrappers (`Component.js`) pointing to `Desktop`, `Tablet`, and `Mobile` folders.

---

## 2. Technical Stack
- **Frontend**: Next.js 16 (App Router), React 19, React Query (`@tanstack/react-query`) for state management. **No localStorage** for states/session tracking.
- **Backend Services**: Node.js + Express.js APIs (`services/account-api`, `services/user-api`, `services/admin-api`, `services/upload-api`).
- **Database**: MongoDB Atlas with shared schema package (`packages/schemaPackage`).
- **Security**: Asymmetric RSA handshake + AES encryption for auth payloads. Session management via HttpOnly cookies and JWT.

---

## 3. Current Sprint & Implementation Progress
### Phase 1: Authentication Foundation (COMPLETED)
- [x] Next.js and Express Workspace setups.
- [x] RSA+AES encryption integration.
- [x] Multi-step sign-up logic (Username availability check ➡️ email ➡️ name ➡️ password).
- [x] React Query caching setup.
- [x] Responsive routing/session redirection.

### Phase 2: User Polish & Verification (COMPLETED)
- [x] Email Verification (Nodemailer + OTP/Magic Link).
- [x] Profile Progress Indicator (2/4 steps completed).
- [x] Active Session Management (List/Kill active sessions in Account Portal).
- [x] Personal Information Editing in Profile.
- [x] Hybrid RSA + AES selective request payload encryption (Signup/Login/Profile updates).
- [x] In-memory React Query state cache encryption/decryption via custom hooks.
- [x] Standard legal and informational public pages (About, Contact, Privacy, Terms) matching AMOLED theme.

### Backlog & Future Services
- [ ] Chat Service (Socket.io real-time chat).
- [ ] Cloud Storage integration.
- [ ] OTP Login UI design.
- [ ] Google Drive Encrypted Asset Storage

---

## 4. Operational Instructions for the Agent (Self-Reference)
- **Rules Verification**: Before doing any code modification, always read [Rules.md](file:///home/vaibhav-senta/GitHub/Cloud-Base/docs/Rules.md) and [Design.md](file:///home/vaibhav-senta/GitHub/Cloud-Base/docs/Design.md).
- **Zero-Touch Policy**: Respect manual changes made by Vaibhav. Do not overwrite custom styles/code without asking.
- **Network Setting**: Use IP `172.20.10.2` for local network testing.
- **Environment**: Notify Vaibhav immediately when any new `.env` key is introduced.
- **Mobile-First Priority**: Focus strictly on Mobile-size styling and features first. Do not spend time on Tablet or Desktop adaptations unless explicitly asked.

---

## 5. Next Steps Checklist
- [ ] Align with Vaibhav on beginning Phase 2 (specifically Email Verification or Active Session management).
- [ ] Update `docs/Tracker.md` and this memory file (`docs/brain.md`) when progress is made.
