'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  const hideNavbarPaths = ['/login', '/signup'];

  if (hideNavbarPaths.includes(pathname)) {
    return null; // Login page par kuch render nahi hoga
  }

  return <Navbar />;
}