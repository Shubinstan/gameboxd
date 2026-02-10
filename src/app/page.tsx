'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

import { Navbar } from '@/components/layout/Navbar';
import { LibraryGrid } from '@/components/library/LibraryGrid';
import { LandingPage } from '@/components/landing/LandingPage';
import { useAuth } from '@/features/auth/AuthContext';
import { LibraryService } from '@/features/library/LibraryService';
import { Game } from '@/interfaces';

// LAZY LOADING MODALS
const SearchModal = dynamic(() => import('@/components/search/SearchModal').then(mod => mod.SearchModal), {
  ssr: false, 
});

const GameDetailsModal = dynamic(() => import('@/components/game/GameDetailsModal').then(mod => mod.GameDetailsModal), {
  ssr: false,
});

const AuthModal = dynamic(() => import('@/components/auth/AuthModal').then(mod => mod.AuthModal), {
  ssr: false,
});

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('register');

  // LOAD LIBRARY
  useEffect(() => {
    async function loadLibrary() {
      if (user) {
        setLoadingGames(true);
        try {
          const userGames = await LibraryService.getUserLibrary(user.uid);

          const sortedGames = userGames.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
          setGames(sortedGames);
        } catch (error) {
          console.error("Failed to load library:", error);
        } finally {
          setLoadingGames(false);
        }
      } else {
        setGames([]); 
      }
    }
    loadLibrary();
  }, [user]);

  // FILTER: SHOW ONLY ACTIVE GAMES (Change this if you want to see Backlog here too)
  const collectionGames = useMemo(() => {

      return games.filter(g => g.status !== 'BACKLOG' && g.status !== 'DROPPED');
  }, [games]);

  // HANDLERS
  const handleAddGame = async (newGame: Game) => {
    if (!user) return;
    

    const gameToAdd: Game = { 
        ...newGame, 
        status: 'PLAYING', 
        addedAt: Date.now() 
    };
    
    
    setGames(prev => [gameToAdd, ...prev]);
    
    
    try {
        await LibraryService.addGame(user.uid, gameToAdd);
    } catch (error) {
        console.error("Failed to save game", error);
        
        setGames(prev => prev.filter(g => g.id !== gameToAdd.id));
    }
  };

  const handleUpdateGame = async (gameId: string, updates: Partial<Game>) => {
    if (!user) return;
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, ...updates } : g));
    await LibraryService.updateGame(user.uid, gameId, updates);
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!user) return;
    setGames(prev => prev.filter(g => g.id !== gameId));
    await LibraryService.removeGame(user.uid, gameId);
  };

  const handleLandingLogin = () => {
    setAuthView('register');
    setIsAuthOpen(true);
  };

  if (authLoading) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
        </div>
      );
  }

  return (
    <main className="min-h-screen bg-[#050505] overflow-x-hidden selection:bg-[#D4AF37] selection:text-black">
      <Navbar />

      <div className="pt-24 pb-16 min-h-[calc(100vh-64px)]">
        
        {!user ? (
            <div className="animate-in fade-in duration-700">
                <LandingPage onLoginClick={handleLandingLogin} />
            </div>
        ) : (
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* HEADER */}
                <div className="mb-10 text-left">
                    <h1 
                        className="w-fit peer font-black text-white leading-none tracking-tighter opacity-90 font-rajdhani transition-opacity duration-300 hover:opacity-100 select-none cursor-default break-all sm:break-normal"
                        style={{ fontSize: 'clamp(2rem, 11vw, 9rem)' }}
                    >
                        COLLECTION
                    </h1>
                    
                    <div className="flex items-center gap-2 md:gap-4 text-neutral-500 font-rajdhani text-xs md:text-lg mt-3 transition-all duration-300 peer-hover:translate-x-2 peer-hover:text-[#D4AF37]">
                        <span className="text-[#D4AF37]">///</span>
                        <span className="whitespace-nowrap">SYSTEM STATUS: ONLINE</span>
                        <span className="w-1 h-1 bg-neutral-600 rounded-full hidden sm:inline" />
                        <span className="hidden sm:inline">{collectionGames.length} ACTIVE ENTRIES</span>
                    </div>
                </div>

                {/* GRID */}
                <div className="w-full">
                    {loadingGames ? (
                        <div className="flex items-center justify-center h-64 text-[#D4AF37]">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : (
                        <LibraryGrid 
                            initialGames={collectionGames} 
                            onAddGameClick={() => setIsSearchOpen(true)} 
                            onGameClick={(game) => setSelectedGame(game)}
                        />
                    )}
                </div>
            </div>
        )}
      </div>

      {/* MODALS */}
      {isSearchOpen && (
        <SearchModal 
            isOpen={isSearchOpen} 
            onClose={() => setIsSearchOpen(false)}
            onAddGame={handleAddGame}
        />
      )}

      {selectedGame && (
        <GameDetailsModal
            isOpen={!!selectedGame}
            game={selectedGame}
            onClose={() => setSelectedGame(null)}
            onUpdate={handleUpdateGame}
            onDelete={handleDeleteGame}
        />
      )}

      {isAuthOpen && (
        <AuthModal 
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            initialView={authView}
        />
      )}

    </main>
  );
}