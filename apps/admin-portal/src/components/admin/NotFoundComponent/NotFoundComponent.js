/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React from 'react';
import Link from 'next/link';
import './NotFoundComponent.css'; // Apne folder ki CSS normal import

export default function NotFoundComponent() {
  return (
    <div className="notfound-container">
      <h1 className="notfound-title">404</h1>
      <h2 className="notfound-subtitle">Security Gate: Page Not Found</h2>
      <p className="notfound-text">
        Jis console route par tum jaane ki koshish kar rahe ho, wo exist nahi karta ya uski access restricted hai.
      </p>
      <Link href="/dashboard" className="notfound-btn">
        Back to Dashboard
      </Link>
    </div>
  );
}