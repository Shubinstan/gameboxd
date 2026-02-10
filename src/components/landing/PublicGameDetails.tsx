'use client';

import { X, Calendar, Monitor, Globe, Star, Award, Building2 } from 'lucide-react';
import Image from 'next/image';
import { Game } from '@/interfaces';


export interface LandingGame extends Game {
  description: string;
  publisher: string;
  metacritic?: number;
  ignRating?: string;
  genres?: string[];
}

interface PublicGameDetailsProps {
  game: LandingGame | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PublicGameDetails({ game, isOpen, onClose }: PublicGameDetailsProps) {
  if (!isOpen || !game) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-4xl bg-[#0F0F0F] border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 max-h-[90vh] md:h-auto">
        
        {/* === LEFT: POSTER === */}
        <div className="w-full md:w-[350px] relative shrink-0">
            <div className="w-full h-full min-h-[400px] relative">
                <Image 
                    src={game.coverUrl} 
                    alt={game.title} 
                    fill 
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent md:bg-gradient-to-r" />
            </div>
        </div>

        {/* === RIGHT: INFO === */}
        <div className="flex-1 p-8 md:p-10 flex flex-col overflow-y-auto custom-scrollbar bg-[#0F0F0F]">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase leading-none tracking-tight font-rajdhani mb-2">
                        {game.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-neutral-400">
                        <span className="text-white px-2 py-0.5 border border-white/20 rounded text-xs">{game.releaseYear}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {game.developer}</span>
                        <span>•</span>
                        <span className="text-[#D4AF37]">{game.publisher}</span>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Ratings Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#1A1A1A] p-3 rounded-lg border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Metacritic</span>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-[#FFCC33] text-black font-black flex items-center justify-center text-lg">
                            {game.metacritic || '-'}
                        </div>
                    </div>
                </div>
                <div className="bg-[#1A1A1A] p-3 rounded-lg border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">IGN</span>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-[#E60012] text-white font-black flex items-center justify-center text-sm">
                            {game.ignRating || '-'}
                        </div>
                    </div>
                </div>
                <div className="bg-[#1A1A1A] p-3 rounded-lg border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">User Score</span>
                    <div className="flex items-center gap-1 text-[#D4AF37]">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold text-lg">{(game.rating || 0) > 0 ? game.rating : 'TBD'}</span>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="mb-8">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> About
                </h3>
                <p className="text-neutral-300 leading-relaxed text-sm md:text-base font-sans">
                    {game.description}
                </p>
            </div>

            {/* Platforms & Footer */}
            <div className="mt-auto pt-6 border-t border-white/10">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Monitor className="w-4 h-4" /> Platforms
                </h3>
                <div className="flex flex-wrap gap-2">
                    
                    {(['PC', 'PS5', 'XSX'] as const).map((p) => (
                        <span key={p} className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs font-bold text-neutral-300">
                            {p}
                        </span>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}