---
name: legal-compliance
description: >-
  Guideline cheatsheet for legal and compliance requirements, copyright checks, and EULA/Terms verification.
---

# Legal & Compliance Workflow Checklist

Use this skill when auditing files for copyright headers, updating Terms of Service, EULA content, Privacy Policies, or validating legal restrictions of Nothingbox Labs.

---

## 1. Copyright Header Standard

Every source file (`.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.css`, `.sh`, `.py`, `.nginx`) created or modified must contain the copyright header:

### Standard Formats:
- **JS/TS/CSS/MJS:**
  ```javascript
  /* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
  ```
- **Bash/Python/Nginx/Config:**
  ```bash
  # Copyright (c) 2026 Vaibhav Senta. All Rights Reserved.
  ```
- **HTML/XML/Markdown (if requested):**
  ```html
  <!-- Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. -->
  ```

### Structural Rules:
- If shebang (`#!/usr/bin/env node` or similar) is present, the shebang **MUST** stay at line 1. Place the copyright header on line 2.
- In Next.js client component files, place the copyright header on line 1, before `'use client';` or right after shebang/directives if any.

---

## 2. EULA & Privacy Policy Audits

When modifying authentication or onboarding flows (e.g. login/signup components):
1. Ensure the user-facing terms agreement links are present at Step 1 of the signup process.
2. Always link to the `/terms` route in the account portal:
   - Terms link: `/terms`
   - Privacy Policy anchor link: `/terms#7-privacy-policy`
   - Cookies Policy anchor link: `/terms#8-cookie-policy`
3. Verify that links use Next.js `Link` components to prevent full-page refreshes.
4. Check that styles map to the AMOLED theme with active links styled in Instagram Blue (`var(--accent-primary)`).

---

## 3. Jurisdiction & Company Identity

Ensure any legally binding text, agreement, or metadata references the following exact details:
- **Company Name:** Nothingbox Labs
- **Product Name:** Cloud-Base Platform
- **Root Domain:** nothingbox.site
- **Governing Law:** India
- **Jurisdiction:** Bhavnagar, Gujarat, India
- **Contact Email:** legal@nothingbox.site
