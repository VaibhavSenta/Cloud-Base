'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Button from '../ui/Button';
import { useRouter, usePathname } from 'next/navigation';
import './Navbar.css';
import axios from 'axios';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
   const checkUser = () => {
     let info = Cookies.get('user_info');
   
   if (info) {
     try {
       // 1. Decode special characters
       let decodedInfo = decodeURIComponent(info);
 
       
       // 2. Remove 'j:' prefix if availabe
       if (decodedInfo.startsWith('j:')) {
         decodedInfo = decodedInfo.substring(2);
       }
 
       // 3. Extra quotes saaf karo (kabhi kabhi string ke bahar extra " hote hain)
       const cleanInfo = decodedInfo.replace(/^"|"$/g, ''); 
 
       const parsed = JSON.parse(cleanInfo);
       setUser(parsed);
     } catch (e) {
       console.error("Final Parsing Error:", e);
       setUser(null);
     }
   } else {
     setUser(null);
   }
   };
    // Sirf function ko call karo
    checkUser();
    
    // Yahan return nahi aayega
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const result = await axios.post('/api/v1/auth/logout'); // Fixed 'v1' typo
      if (result.data.success) {
        console.log("Logged out successfully");
        Cookies.remove('user_info');
        setUser(null);
        router.push('/login');
      }
    } catch (error) {
      console.log("Logout failed or already logged out.");
      // Force cleanup even if API fails
      Cookies.remove('user_info');
      setUser(null);
      router.push('/login');
    }
  };

  
  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => router.push('/')}>
        Cloud-Base
      </div>

      <div className="nav-content">
        {user ? (
          <div className="nav-user-section">
            {/* <span className="nav-welcome">Hi, {user.userName} </span> */}
            <Button variant="outline" onMouseEnter={() => router.prefetch('/profile')} onClick={() => router.push('/profile')} >Hi, {user.userName}</Button>
          </div>
        ) : (
          <div className="nav-auth-btns">
            <Button variant="outline" onMouseEnter={() => router.prefetch('/login')} onClick={() => router.push('/login')}>Login</Button>
            <Button variant="primary" onMouseEnter={() => router.prefetch('/login')} onClick={() => router.push('/signup')}>Register</Button>
          </div>
        )}
      </div>
    </nav>
  );
}