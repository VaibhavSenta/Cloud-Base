'use client';
import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import './login.css';

export default function LoginPage() {
  const [loginid, setLoginid] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        console.log(loginid);
        console.log(password);
        
        
      const res = await axios.post('/api/v1/auth/login', { loginid, password });
      
      
      router.push('/'); // Home page pe redirect
      
    } catch (err) {
      alert("Login failed: " + err.response?.data?.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <div className="login-logo" onClick={() => router.push('/')}>
          Cloud-Base
        </div>
        <h2>Welcome Back</h2>
        <p>Login to manage your cloud space</p>
        
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Email or Username" 
            value={loginid}
            onChange={(e) => setLoginid(e.target.value)}
            required 
          />
        </div>
        
        <div className="input-group">
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>

        <Button variant="primary" type="submit" className="w-full">
          Login
        </Button>
        
        <div className="login-footer">
        Do not have an account? <a href="/signup">Sign Up</a>
        </div>
      </form>
    </div>
  );
}