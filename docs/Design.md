# Design Guidelines - Cloud-Base

## 1. Visual Language
- **Style:** Zen-Luxury / Minimalist.
- **Theme:** Default AMOLED Black (`#000000`).
- **Accent:** Instagram-style Blue (`#0095f6`).

## 2. Typography
- **Headings:** Bold/Extra-Bold for Branding, Semi-Bold (weight 600) for UI Steps.
- **Spacing:** Generous padding, centered layouts for Desktop/Tablet, Edge-to-Edge for Mobile.

## 3. Asset Policy (CRITICAL)
- **No Icons:** Strictly text-first design.
- **No Emojis:** Avoid unless requested for specific placeholders.
- **Manual Assets:** Icons must be explicitly requested and saved in the `/public/icons` folder by the Partner.

## 4. UI Patterns
- **The Wrapper Pattern:** Every component has a Wrapper (`Component.js`) and variants (`Mobile/`, `Tablet/`, `Desktop/`).
- **Glassmorphism:** Use `backdrop-filter: blur(12px)` for cards on larger screens.
