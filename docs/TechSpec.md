# Technical Specification (TechSpec) - Cloud-Base

## 1. Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, React Query (@tanstack/react-query).
- **Backend:** Node.js, Express.js, Socket.io (for real-time).
- **Database:** MongoDB Atlas (Cloud Cluster).
- **Monorepo:** NPM Workspaces.

## 2. Security Architecture (Hybrid Encryption)
- **Asymmetric (RSA):** Used for secure key exchange (Handshake).
- **Symmetric (AES):** Used for high-speed data encryption/decryption.
- **Hashing:** Bcryptjs for one-way password storage.
- **Sessions:** HttpOnly Cookies + JWT (JSON Web Tokens).

## 3. Network Configuration
- **API Base:** Managed via Next.js `rewrites` (Proxies).
- **CORS:** Dynamic origin handling for local dev (IP-based) and production.
- **Port Mapping:** 
  - Frontend: 3000
  - Account API: 5010
