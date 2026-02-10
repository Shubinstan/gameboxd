'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Twitter, Instagram, Github, Play, ArrowRight, Loader2 } from 'lucide-react';
import { PublicGameDetails, LandingGame } from './PublicGameDetails';

// === STATIC DATA (FALLBACK) ===
const FALLBACK_GAMES: LandingGame[] = [
  { 
    id: 'f1', title: 'Cyberpunk 2077', 
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/coaih8.jpg', 
    releaseYear: 2020, developer: 'CD Projekt RED', publisher: 'CDPR', status: 'COMPLETED', rating: 4.5, metacritic: 86, ignRating: '9/10', description: "An open-world, action-adventure RPG set in the dark future of Night City." 
  },
  { 
    id: 'f2', title: 'Alan Wake 2', 
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6jar.jpg', 
    releaseYear: 2023, developer: 'Remedy', publisher: 'Epic Games', status: 'PLAYING', rating: 5.0, metacritic: 89, ignRating: '10/10', description: "Saga Anderson arrives to investigate ritualistic murders in Bright Falls." 
  },
  { 
    id: 'f3', title: 'Silent Hill 2', 
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/coavaf.jpg', 
    releaseYear: 2024, developer: 'Bloober Team', publisher: 'Konami', status: 'BACKLOG', rating: 4.8, metacritic: 86, ignRating: '9/10', description: "James Sunderland travels to Silent Hill after receiving a letter from his deceased wife." 
  },
  { 
    id: 'f4', title: 'Elden Ring', 
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_720p/co4jni.jpg', 
    releaseYear: 2022, developer: 'FromSoftware', publisher: 'Bandai', status: 'COMPLETED', rating: 5.0, metacritic: 96, ignRating: '10/10', description: "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring." 
  },
  { 
    id: 'f5', title: 'Baldur\'s Gate 3', 
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_720p/co670h.jpg', 
    releaseYear: 2023, developer: 'Larian', publisher: 'Larian', status: 'COMPLETED', rating: 5.0, metacritic: 96, ignRating: '10/10', description: "Gather your party and return to the Forgotten Realms." 
  },
  { 
    id: 'f6', title: 'Resident Evil 4', 
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6bo0.jpg', 
    releaseYear: 2023, developer: 'Capcom', publisher: 'Capcom', status: 'COMPLETED', rating: 4.9, metacritic: 93, ignRating: '10/10', description: "Survival is just the beginning. Six years have passed since the biological disaster in Raccoon City." 
  },
];

const NEWS_ITEMS = [
  { id: 1, title: "GTA VI: New Trailer Breakdown", image: "https://images.igdb.com/igdb/image/upload/t_screenshot_med/scionf.jpg", date: "2 HOURS AGO", category: "NEWS" },
  { id: 2, title: "The Best Indie Games of 2024 So Far", image: "https://images.igdb.com/igdb/image/upload/t_screenshot_med/sc6khu.jpg", date: "5 HOURS AGO", category: "EDITORIAL" },
  { id: 3, title: "Switch 2 Hardware Specs Leaked?", image: "https://images.igdb.com/igdb/image/upload/t_screenshot_med/sc90qg.jpg", date: "1 DAY AGO", category: "RUMOR" }
];

interface LandingPageProps {
  onLoginClick: () => void;
}

export function LandingPage({ onLoginClick }: LandingPageProps) {
  // OPTIMIZATION: Initialize with FALLBACK data immediately.
  // This prevents "Layout Shift" and improves LCP drastically.
  const [games, setGames] = useState<LandingGame[]>(FALLBACK_GAMES);
  const [selectedGame, setSelectedGame] = useState<LandingGame | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchGames() {
      try {
        const res = await fetch('/api/landing', { method: 'POST' });
        
        if (!res.ok) throw new Error("API Request Failed");
        
        const data = await res.json();
        
        if (data.games && data.games.length > 0 && isMounted) {
            const mappedGames: LandingGame[] = data.games.map((g: any) => ({
              id: g.id,
              title: g.title,
              coverUrl: g.coverUrl,
              rating: Math.round(g.rating / 20 * 10) / 10,
              releaseYear: new Date().getFullYear(),
              
              developer: g.developer || 'Unknown', 
              publisher: g.publisher || 'Unknown',
              status: 'BACKLOG',
              metacritic: Math.round(g.rating),
              ignRating: 'N/A',
              
              description: g.summary || `Discover ${g.title} on Gameboxd.`
            }));

            
            setGames(mappedGames);
        }
      } catch (error) {
        console.warn("API failed, keeping fallback data.", error);
        
      }
    }

    fetchGames();
    
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="w-full bg-[#14181c] text-white font-sans selection:bg-[#D4AF37] selection:text-black">
      
      {/* === HERO SECTION === */}
      <div className="relative w-full min-h-[100dvh] flex flex-col items-center justify-between pt-32 pb-10 overflow-hidden">
        
        {/* 1. DYNAMIC BACKGROUND (MARQUEE) */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
            {/* RENDER GRID IMMEDIATELY (No loading check) */}
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 w-[120%] -ml-[10%] -mt-[10%] opacity-40 grayscale-[50%] animate-pulse">
                {[...games, ...games].slice(0, 30).map((game, idx) => (
                    <div key={`bg-${game.id}-${idx}`} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#1a1a1a]">
                        {game.coverUrl ? (
                            <Image 
                                src={game.coverUrl} 
                                alt="" 
                                fill 
                                className="object-cover"
                                sizes="(max-width: 768px) 33vw, 16vw"
                                // Priority loading for first few images (LCP boost)
                                priority={idx < 10}
                            />
                        ) : null}
                    </div>
                ))}
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] via-[#14181c]/60 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#14181c]/90 via-transparent to-[#14181c]" />
        </div>

        {/* 2. CENTER CONTENT */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex-1 flex flex-col justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 drop-shadow-2xl font-rajdhani uppercase leading-[0.9] text-shadow-lg">
            Track games you’ve played.<br />
            <span className="text-neutral-400">Save those you want to play.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-neutral-200 mb-10 font-medium drop-shadow-md tracking-wide max-w-xl">
            The social network for video game lovers.
          </p>
          
          <button 
            onClick={onLoginClick}
            className="group relative inline-flex items-center justify-center gap-3 bg-[#D4AF37] hover:bg-[#FCD34D] text-black font-black py-4 px-8 md:px-12 rounded-sm text-base md:text-lg tracking-[0.2em] uppercase transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.5)] active:scale-95"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>Press Start to Join</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3. TRENDING ROW */}
        <div className="relative z-20 w-full px-4 md:px-8 mt-12 md:mt-0">
             <div className="max-w-7xl mx-auto">
                 <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 text-center md:text-left">
                    Trending Games
                 </p>
                 
                 {/* GRID ALWAYS RENDERED (Data updates dynamically) */}
                 <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-5">
                    {games.slice(0, 6).map((game) => (
                        <div 
                            key={game.id} 
                            onClick={() => setSelectedGame(game)}
                            className="group relative aspect-[2/3] shadow-2xl rounded-sm overflow-hidden cursor-pointer hover:ring-2 ring-[#D4AF37] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-[#1a1a1a]"
                        >
                            {game.coverUrl && (
                                <Image 
                                    src={game.coverUrl} 
                                    alt={game.title} 
                                    fill 
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 768px) 33vw, 16vw"
                                />
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            
                            {(game.rating || 0) > 0 && (
                                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur text-[#D4AF37] text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {game.rating}
                                </div>
                            )}
                        </div>
                    ))}
                 </div>
             </div>
        </div>
      </div>

      {/* === NEWS SECTION === */}
      <div className="bg-[#14181c] w-full py-16 border-t border-white/5 relative z-30">
        <div className="container mx-auto px-6 md:px-12">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest border-b border-white/10 pb-2 w-full">
                    Gaming News & Features
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {NEWS_ITEMS.map((item) => (
                    <div key={item.id} className="group cursor-pointer">
                        <div className="relative aspect-video rounded-md overflow-hidden mb-4 shadow-lg bg-neutral-900">
                            <Image 
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <span className="absolute bottom-2 left-2 bg-[#D4AF37] text-black text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                {item.category}
                            </span>
                        </div>
                        <h4 className="text-lg font-bold text-white leading-tight group-hover:text-[#D4AF37] transition-colors mb-2">
                            {item.title}
                        </h4>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                            {item.date} • IGN
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* === FOOTER === */}
      <footer className="bg-[#0e1114] py-12 border-t border-white/5 text-neutral-400 text-sm relative z-30">
         <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between gap-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-2">
                <a href="#" className="hover:text-white transition-colors">About</a>
                <a href="#" className="hover:text-white transition-colors">News</a>
                <a href="#" className="hover:text-white transition-colors">Pro</a>
                <a href="#" className="hover:text-white transition-colors">Apps</a>
                <a href="#" className="hover:text-white transition-colors">Podcast</a>
                <a href="#" className="hover:text-white transition-colors">API</a>
            </div>

            <div className="flex flex-col items-start md:items-end gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-full hover:bg-white/10 cursor-pointer text-white hover:text-[#D4AF37] transition-colors">
                        <Twitter className="w-4 h-4" />
                    </div>
                    <div className="p-2 bg-white/5 rounded-full hover:bg-white/10 cursor-pointer text-white hover:text-[#D4AF37] transition-colors">
                        <Instagram className="w-4 h-4" />
                    </div>
                    <div className="p-2 bg-white/5 rounded-full hover:bg-white/10 cursor-pointer text-white hover:text-[#D4AF37] transition-colors">
                        <Github className="w-4 h-4" />
                    </div>
                </div>
                <p className="text-xs text-neutral-600 text-right leading-relaxed">
                    © Gameboxd Limited. Made by You. <br />
                    Game data from IGDB.
                </p>
            </div>
         </div>
      </footer>

      {/* READ-ONLY MODAL */}
      <PublicGameDetails
        isOpen={!!selectedGame}
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
      />

    </div>
  );
}