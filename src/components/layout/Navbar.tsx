'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, User as UserIcon, LogOut, Menu, X } from 'lucide-react'; 
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';
import { AuthModal } from '@/components/auth/AuthModal';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  const openAuth = (view: 'login' | 'register') => {
      setAuthView(view);
      setIsAuthOpen(true);
      setIsMobileMenuOpen(false); 
  };

  const navLinks = [
    { name: 'LIBRARY', href: '/' },
    { name: 'REVIEWS', href: '/profile?tab=reviews' },
  ];

  return (
    <>
        <nav className="fixed top-0 left-0 right-0 z-[9999] h-16 border-b border-white/10 bg-[#050505]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[#050505]/60">
            <div className="w-full h-full flex items-center justify-between px-4 md:px-8">
                
                {/* === MOBILE: HAMBURGER BUTTON (LEFT) === */}
                <div className="md:hidden flex items-center">
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-neutral-300 hover:text-white transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* === DESKTOP: LEFT NAVIGATION === */}
                <div className="hidden md:flex items-center gap-8">
                {user ? (
                    navLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href.includes('?') && pathname === link.href.split('?')[0] && window.location.search.includes('tab=reviews'));
                    return (
                        <Link
                        key={link.name}
                        href={link.href}
                        className={cn(
                            "text-sm font-medium tracking-widest transition-all duration-300 hover:text-white",
                            isActive 
                            ? "text-[#D4AF37] drop-shadow-[0_0_5px_rgba(212,175,55,0.5)] border-b-2 border-[#D4AF37] pb-1" 
                            : "text-neutral-400"
                        )}
                        >
                        {link.name}
                        </Link>
                    );
                    })
                ) : (
                    <>
                        <button 
                            onClick={() => openAuth('login')}
                            className="text-sm font-medium tracking-widest text-neutral-300 hover:text-white transition-colors uppercase"
                        >
                            Sign In
                        </button>
                        <button 
                            onClick={() => openAuth('register')}
                            className="text-sm font-bold tracking-widest text-white hover:text-[#D4AF37] transition-colors uppercase border border-white/20 hover:border-[#D4AF37] px-4 py-1.5 rounded-sm"
                        >
                            Create Account
                        </button>
                    </>
                )}
                </div>

                {/* === CENTER: LOGO (Absolute Center) === */}
                <Link href="/" className="group flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                    <Gamepad2 
                        className="w-7 h-7 md:w-8 md:h-8 text-white transition-all duration-500 group-hover:rotate-12 group-hover:text-[#D4AF37] group-hover:drop-shadow-[0_0_10px_#D4AF37]" 
                    />
                    <span className="font-rajdhani text-xl md:text-2xl font-bold tracking-wider text-white group-hover:text-[#D4AF37] transition-colors">
                        GAMEBOXD
                    </span>
                </Link>

                {/* === RIGHT: USER PROFILE === */}
                <div className="flex items-center">
                {user ? (
                    <div className="flex items-center gap-3">
                        <Link 
                            href="/profile"
                            className="flex items-center gap-2 md:gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D4AF37]/50 rounded-full pl-1 md:pl-2 pr-2 md:pr-4 py-1 transition-all duration-300 hover:scale-105 group"
                        >
                            <div className="relative w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden border border-white/20">
                                {user.photoURL ? (
                                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                    <UserIcon className="w-4 h-4 text-neutral-400" />
                                </div>
                                )}
                            </div>
                            
                            <div className="hidden md:flex flex-col items-start leading-none">
                                <span className="text-xs font-bold text-neutral-200 group-hover:text-white max-w-[80px] truncate">
                                {user.displayName?.split(' ')[0] || 'Gamer'}
                                </span>
                                <span className="text-[10px] text-[#D4AF37] flex items-center gap-1 mt-0.5 font-medium tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_4px_#D4AF37]" />
                                ONLINE
                                </span>
                            </div>
                        </Link>

                        <button
                            onClick={() => logout()}
                            className="hidden md:block group p-2 rounded-full hover:bg-white/5 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5 text-neutral-500 transition-colors duration-300 group-hover:text-red-500 group-hover:scale-110" />
                        </button>
                    </div>
                ) : (
                    
                    <div className="md:hidden w-8" /> 
                )}
                </div>
            </div>

            {/* === MOBILE MENU OVERLAY === */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-[#0F0F0F] border-b border-white/10 p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top-5 duration-200">
                    {user ? (
                        <>
                            <div className="flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <Link 
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-lg font-bold text-white tracking-widest hover:text-[#D4AF37]"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                <Link 
                                    href="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-bold text-white tracking-widest hover:text-[#D4AF37]"
                                >
                                    PROFILE
                                </Link>
                            </div>
                            <div className="h-px bg-white/10 w-full" />
                            <button 
                                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                className="flex items-center gap-2 text-red-500 font-bold tracking-widest"
                            >
                                <LogOut className="w-5 h-5" /> LOGOUT
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-4">
                             <button 
                                onClick={() => openAuth('login')}
                                className="w-full py-3 bg-white/5 border border-white/10 rounded text-white font-bold tracking-widest uppercase"
                            >
                                Sign In
                            </button>
                            <button 
                                onClick={() => openAuth('register')}
                                className="w-full py-3 bg-[#D4AF37] text-black rounded font-bold tracking-widest uppercase"
                            >
                                Create Account
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>

        <AuthModal 
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            initialView={authView}
        />
    </>
  );
}