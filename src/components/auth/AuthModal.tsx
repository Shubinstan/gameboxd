'use client';

import { useState } from 'react';
import { X, Mail, Lock, User, Chrome, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  
  const [view, setView] = useState<'login' | 'register'>(initialView);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Only for register

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        if (view === 'login') {
            await loginWithEmail(email, password);
        } else {
            await registerWithEmail(email, password, username);
        }
        onClose();
    } catch (err: any) {
        // Simplified Firebase error handling
        if (err.code === 'auth/invalid-credential') setError("Invalid email or password.");
        else if (err.code === 'auth/email-already-in-use') setError("Email already registered.");
        else if (err.code === 'auth/weak-password') setError("Password should be at least 6 characters.");
        else setError("Something went wrong. Try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
        await loginWithGoogle();
        onClose();
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header Image / Pattern */}
        <div className="h-32 bg-gradient-to-br from-[#1a1a1a] to-black relative flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
             <h2 className="text-3xl font-rajdhani font-black text-white tracking-widest relative z-10">
                GAME<span className="text-[#D4AF37]">BOXD</span>
             </h2>
             <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
             </button>
        </div>

        <div className="p-8">
            {/* Toggle Tabs */}
            <div className="flex p-1 bg-white/5 rounded-lg mb-8">
                <button 
                    onClick={() => { setView('login'); setError(''); }}
                    className={cn(
                        "flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all",
                        view === 'login' ? "bg-[#D4AF37] text-black shadow-lg" : "text-neutral-500 hover:text-white"
                    )}
                >
                    Sign In
                </button>
                <button 
                    onClick={() => { setView('register'); setError(''); }}
                    className={cn(
                        "flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all",
                        view === 'register' ? "bg-[#D4AF37] text-black shadow-lg" : "text-neutral-500 hover:text-white"
                    )}
                >
                    Register
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {view === 'register' && (
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Username</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-[#D4AF37] transition-colors" />
                            <input 
                                type="text" 
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                className="w-full bg-[#1A1A1A] border border-white/10 text-white pl-10 pr-4 py-3 rounded-lg text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 outline-none transition-all placeholder:text-neutral-700"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-[#D4AF37] transition-colors" />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full bg-[#1A1A1A] border border-white/10 text-white pl-10 pr-4 py-3 rounded-lg text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 outline-none transition-all placeholder:text-neutral-700"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-[#D4AF37] transition-colors" />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#1A1A1A] border border-white/10 text-white pl-10 pr-4 py-3 rounded-lg text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 outline-none transition-all placeholder:text-neutral-700"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-white text-black font-bold py-3 rounded-lg mt-6 hover:bg-[#D4AF37] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <>
                            {view === 'login' ? 'Continue' : 'Create Account'}
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            <div className="my-6 flex items-center gap-4">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-[10px] font-bold text-neutral-600 uppercase">Or continue with</span>
                <div className="h-px bg-white/10 flex-1" />
            </div>

            <button 
                onClick={handleGoogleLogin}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-3"
            >
                <Chrome className="w-5 h-5 text-white" />
                <span>Google Account</span>
            </button>

        </div>
      </div>
    </div>
  );
}