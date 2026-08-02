# Chat App — Detailed Architectural Discussion Checklist

Ye Cloud-Base project rules aur strict architectural guidelines ke hisab se updated checklist hai. Isme humare stack aur security standards ko add kiya gaya hai. Is document me total 40 items hain.

---

## A. Core Concept & Vision (App Ka DNA)
1. Chat app ka main purpose kya hai? (Personal messaging, Group collaboration, ya dono?)
2. Kya ye sirf Cloud-Base users ke beech ka chat hoga, ya external users ko bhi invite kar sakte hain?
3. Kya ye WhatsApp/Telegram jaisa personal chat hoga ya Slack/Discord jaisa workspace chat?
4. Chat app ka ek-line tagline kya hoga? (Branding ke liye)
5. Minimum Viable Product (MVP) me kya-kya hoga aur kya Phase 2 me jayega?

---

## B. User Authentication & Access
6. Chat app access karne ke liye Cloud-Base login mandatory hai ya optional?
7. Kya user bina login ke koi bhi chat dekh sakta hai (read-only guest mode)?
8. Chat app ka apna alag session hoga ya main Cloud-Base session se linked rahega?
9. Agar user ek device par logout kare, toh chat session bhi khatam hoga ya nahi?
10. Kya multiple devices par simultaneously chat access ho sakta hai?

---

## C. Encryption & Security (Strict Cloud-Base Rules)
11. **Hybrid Key Exchange**: Asymmetric RSA handshake kaise perform hoga user-to-user aur client-to-server connection status ke dauran?
12. **Payload Encryption**: REST aur WebSocket payloads ko AES-256-GCM se encrypt karne ke liye symmetric keys dynamically memory me kaise manage hongi?
13. **Key Storage Rules**: Session keys ko strictly context/memory state me rakhna hoga—**strictly NO localStorage** ya storage persistent state fallback. Keys memory leak se kaise bachayi jayengi?
14. **Database Encryption**: Backend (MongoDB/PostgreSQL) me message history encrypted form me store hogi? Server ke paas keys decrypt karne ki capability honi chahiye (search index ke liye) ya strictly client-side decryption (Zero-Knowledge)?
15. **SSL/WSS Handshake**: Cloud-Base certificate setup aur WebSocket over TLS (wss://) connection details local network port forwarding ke sath.
16. **Session Hijacking Protection**: Token validation inside connection handshakes and periodic heartbeat encryption verification.

---

## D. State & Session Management (Strictly React Query)
17. **React Query Configuration**: Messages list aur chat metadata queries cache update invalidation strategy (fetching intervals vs real-time sockets push invalidation).
18. **Strictly NO localStorage**: Network reconnection status ya active chat window references store karne ke liye browser native localStorage block kiya gaya hai. Context states ya Zustand pure transient stores kaise coordinate karenge?
19. **Message Cache limits**: PWA lifecycle active rehte memory cache memory footprint control.
20. **Encryption Keys in Query Cache**: Kya decrypted messages ko query cache me save rakhna safe hai ya component render level par decryption on-the-fly behtar hoga?

---

## E. UI/UX Rules & Design System (Aesthetic Constraints)
21. **AMOLED Theme**: Base color `#000000` solid background with pure dark cards structure.
22. **Accent Theme**: Instagram Blue (`#0095f6`) interactive points, highlights, text state indicators, aur unread count highlights.
23. **No-Icon Policy**: Tab changes aur UI action items text-based honge. Kisi bhi navigation ya button me icons/SVG code directly use nahi hoga jab tak exception explicitly clear na ho. Text hierarchy define karna clear readability ke liye.
24. **Component Wrapper Pattern**: `Component.js` at the component root and place platform-specific layouts in `Desktop/`, `Tablet/`, and `Mobile/` directories.
25. **Mobile-First Priority**: UI files strictly mobile layouts se start karega. Desktop layouts code files ignore rahengi jab tak user request na kare.
26. **Visual micro-animations**: Custom CSS transition rules active hover state, message delivery ticks transitions, loading indicators ke liye.

---

## F. Real-time Communication (WebSockets & REST Integration)
27. Socket.io vs WebSockets protocols selection match with Node backend.
28. WebSocket connections ke authentication parameters verification headers verification inside socket engine middleware.
29. Connection retry logic inside standalone browser state change events.
30. Reconnect status synchronization via React Query invalidation trigger queries.

---

## G. Database Schema & Storage Design
31. Message Model schema: Message ID, Sender, Receiver, Encrypted Content body, Initialization Vector (IV), Timestamp.
32. Conversation metadata schema.
33. Media storage inside server volume mapping (Docker compose volume integration).

---

## H. Chat Types & Features
34. Direct messages (One-to-One).
35. Group chats wrapper layouts.
36. Message statuses (Sent, Delivered, Read ticks text indicators).
37. Typing status broadcasts events format.

---

## I. Infrastructure (Docker & Nginx Local Subdomain Routing)
38. New service addition inside `docker-compose.yml` (`services/chat-api` or microservices framework matching API layout).
39. Subdomain proxy update inside `nginx/nginx.conf` matching target environment `chat.localhost` pointing to internal Next.js/Express service container.
40. Local Network testing parameters targeting binding IP `172.20.10.2`.
