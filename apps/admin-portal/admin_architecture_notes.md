# Admin Portal Architecture & Feature Flags Design Notes

This document tracks system design ideas, specifications, and layout plans for the Admin Portal workspace as we progress with the monorepo development.

---

## 1. Global App Configuration & Feature Flags Schema

To manage features across multiple client apps (e.g., `account-portal`, `user-portal`), we will implement a centralized **Flat Key-Value Store** using dot-notation namespaces.

### MongoDB Schema Draft (`SystemConfig`)
```javascript
const SystemConfigSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  }, // e.g. "auth.social.google"
  value: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  }, // e.g. false (boolean), 10 (number), or JSON object
  description: { 
    type: String 
  },
  group: { 
    type: String, 
    enum: ['authentication', 'security', 'notifications', 'general'] 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });
```

---

## 2. Feature Flags List (Planned)

| Feature Key | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `auth.social.google` | Boolean | `false` | Enable/Disable Signup with Google |
| `auth.social.apple` | Boolean | `false` | Enable/Disable Signup with Apple |
| `auth.social.facebook` | Boolean | `false` | Enable/Disable Signup with Facebook |
| `auth.2fa.required` | Boolean | `true` | Enforce 2FA checks on Login |
| `auth.2fa.email.force` | Boolean | `true` | Prevent users from disabling Email 2FA |
| `security.handshake.rsa.keysize` | Number | `2048` | Size of the ephemeral handshake keys |

---

## 3. Planned Admin Portal Controls (UI Ideas)

1. **Features Control Panel:**
   * A premium settings list grouped by domains (`Authentication`, `Security`, etc.).
   * Sliding toggles to enable/disable features in real-time.
   * Auto-save configuration changes.
2. **System Config Audit Logs:**
   * Track which administrator modified which feature flag.
   * "Restore to Default" button to revert settings.
3. **PWA & Asset Management:**
   * Upload and distribute new app icons, splash screens, and public files to other apps dynamically.
