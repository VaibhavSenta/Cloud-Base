# App Flow & User Journey - Cloud-Base

## 1. Authentication Flow
1. **Entry:** User arrives at root `/` (Login Page).
2. **Handshake:** Frontend automatically fetches RSA Public Key from `/auth/handshake`.
3. **Execution:** User enters credentials ➡️ Data encrypted via RSA+AES ➡️ Sent to backend.
4. **Success:** User receives JWT via Cookie ➡️ Transition to `WelcomeScreen`.

## 2. Signup Journey (Multi-Step)
- **Step 1:** Username availability check.
- **Step 2:** Email input (Partial mode ends here).
- **Step 3:** First Name & Last Name.
- **Step 4:** Password setup (Full mode ends here).

## 3. Post-Auth Navigation
- `Auth Success` ➡️ `Welcome Animation (2s)` ➡️ `Redirect to /dashboard`.
- `/dashboard` checks session via `useQuery(['user'])`.
