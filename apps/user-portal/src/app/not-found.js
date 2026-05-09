'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import './not-found.css';

export default function NotFound() {
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });

  const moveButton = () => {
    // Isse button kam se kam 150px door bhagega aur maximum 300px
    const minJump = 190;
    const maxJump = 300;

    const generateJump = () => {
      const jump = Math.random() * (maxJump - minJump) + minJump;
      return Math.random() > 0.5 ? jump : -jump; // Randomly left ya right / up ya down
    };

    setBtnPos({
      x: generateJump(),
      y: generateJump()
    });
  };

  return (
    <div className="crazy-404 is-404-active">
      <div className="content-box">
        <h1 className="glitch-text">EYE-CHECK?</h1>
        <p className="joke">
          This page exists only in your imagination (and maybe in a bug). <br />
          Even our database is laughing at this URL.
        </p>
        
        <div className="btn-container">
          <Link 
            href="/" 
            className="runaway-btn"
            onMouseEnter={moveButton}
            style={{ transform: `translate(${btnPos.x}px, ${btnPos.y}px)` }}
          >
            ESCAPE TO HOME
          </Link>
        </div>
        
        <span className="footer-note">Don`t try to catch it, it`s faster than your internet.</span>
      </div>
    </div>
  );
}