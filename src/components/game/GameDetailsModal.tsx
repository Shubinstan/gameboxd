'use client';

import { useState, useEffect } from 'react';
import { X, Star, Trash2, Save, Calendar, Monitor, Edit3 } from 'lucide-react';
import { Game, GameStatus } from '@/types';
import { cn } from '@/lib/utils';
import { GameCard } from './GameCard';

interface GameDetailsModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (gameId: string, updates: Partial<Game>) => void;
  onDelete: (gameId: string) => void;
}

const STATUSES: GameStatus[] = ['PLAYING', 'BACKLOG', 'COMPLETED', 'DROPPED'];
const PLATFORMS = ['PC', 'PS5', 'PS4', 'Xbox Series', 'Xbox One', 'Nintendo Switch', 'Steam Deck', 'Mobile', 'Retro'];

export function GameDetailsModal({ game, isOpen, onClose, onUpdate, onDelete }: GameDetailsModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [status, setStatus] = useState<GameStatus>('BACKLOG');
  const [playedOn, setPlayedOn] = useState('PC');
  const [completedAt, setCompletedAt] = useState('');
  const [review, setReview] = useState('');

  useEffect(() => {
    if (game) {
      setRating(game.rating || 0);
      setStatus(game.status || 'BACKLOG');
      const initialPlatform = game.playedOn || game.platform || 'PC';
      setPlayedOn(initialPlatform);
      setCompletedAt(game.completedAt || '');
      setReview(game.userReview || '');
    }
  }, [game]);

  if (!isOpen || !game) return null;

  const handleSave = () => {
    onUpdate(game.id, { rating, status, playedOn, completedAt, userReview: review });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Delete this game?')) {
      onDelete(game.id);
      onClose();
    }
  };

  const calculateRating = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    return index + (isHalf ? 0.5 : 1);
  };

  return (
    // 1. Full screen wrap (Centring)
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* 2. Modal window */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#0F0F0F] border border-white/10 shadow-2xl rounded-xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Close button */}
        <button 
            onClick={onClose} 
            className="absolute top-3 right-3 z-50 p-2 bg-black/50 hover:bg-white/10 rounded-full text-white/70 hover:text-white border border-white/5 transition-colors backdrop-blur-md"
        >
            <X className="w-5 h-5" />
        </button>

        {/* === LEFT COLUMN === */}
        <div className="w-full md:w-1/3 bg-black/40 flex flex-col items-center p-6 border-b md:border-b-0 md:border-r border-white/5 overflow-y-auto custom-scrollbar shrink-0">
            <div className="w-[160px] md:w-[220px] shadow-2xl mb-6 mt-4">
                <GameCard game={{ ...game, rating: hoverRating || rating, status, playedOn }} disabled />
            </div>
            
            <div className="w-full max-w-[240px] space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Monitor className="w-3 h-3" /> Played On
                </label>
                <div className="relative group">
                    <select 
                        value={playedOn}
                        onChange={(e) => setPlayedOn(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-white/10 text-neutral-200 py-2.5 pl-3 pr-8 rounded-lg text-sm focus:border-[#D4AF37] outline-none appearance-none cursor-pointer"
                    >
                        {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                        {!PLATFORMS.includes(playedOn) && <option value={playedOn}>{playedOn}</option>}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                </div>
            </div>
        </div>

        {/* === RIGHT COLUMN (Flex Container) === */}
        
        <div className="w-full md:w-2/3 flex flex-col h-full bg-[#0F0F0F] relative">
            
            {/* 3. SCROLLABLE AREA (Content) */}
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                
                {/* Header */}
                <div className="mb-6 pr-10"> 
                    <h2 className="text-2xl md:text-4xl font-black text-white uppercase leading-tight font-sans break-words">
                        {game.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-2 text-sm font-medium">
                        <span className="bg-white/10 text-white px-2 py-0.5 rounded text-xs font-bold">{game.releaseYear}</span>
                        <span className="text-neutral-500">•</span>
                        <span className="text-neutral-400 text-xs">{game.developer}</span>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-8 p-4 bg-white/5 border border-white/5 rounded-lg max-h-[150px] overflow-y-auto custom-scrollbar shadow-inner">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        Synopsis
                    </h3>
                    <p className="text-neutral-300 text-sm leading-relaxed font-sans whitespace-pre-line">
                        {game.description || game.summary || "No description available."}
                    </p>
                </div>

                {/* Companies */}
                <div className="flex flex-wrap gap-6 mb-8 text-xs font-rajdhani tracking-wider border-b border-white/5 pb-6">
                    <div className="flex flex-col">
                        <span className="text-neutral-500 font-bold uppercase mb-1">Developer</span>
                        <span className="text-white font-medium">{game.developer || "Unknown"}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-neutral-500 font-bold uppercase mb-1">Publisher</span>
                        <span className="text-white font-medium">{game.publisher || game.developer || "Unknown"}</span>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-6 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-neutral-500 tracking-[0.2em] uppercase mb-2 block">Status</label>
                            <div className="flex flex-wrap gap-2">
                                {STATUSES.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s)}
                                    className={cn(
                                    "px-2 py-1.5 border text-[10px] font-bold tracking-widest transition-all rounded uppercase flex-grow text-center",
                                    status === s 
                                        ? `bg-[#D4AF37] text-black border-[#D4AF37] shadow-sm` 
                                        : "bg-transparent text-neutral-500 border-white/10 hover:border-white/30 hover:text-white"
                                    )}
                                >
                                    {s}
                                </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-neutral-500 tracking-[0.2em] uppercase mb-2 block">Date Completed</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600 pointer-events-none" />
                                <input 
                                    type="date" 
                                    value={completedAt}
                                    onChange={(e) => setCompletedAt(e.target.value)}
                                    className="w-full bg-[#1A1A1A] border border-white/10 text-white pl-9 pr-3 py-1.5 rounded text-sm focus:border-[#D4AF37] outline-none uppercase font-mono [color-scheme:dark]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#151515] p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-bold text-neutral-500 tracking-[0.2em] uppercase">Rating</label>
                            <span className={cn("text-xl font-black", (hoverRating || rating) > 0 ? "text-[#D4AF37]" : "text-neutral-700")}>
                                {(hoverRating || rating) > 0 ? (hoverRating || rating).toFixed(1) : '-'} <span className="text-[10px] text-neutral-600">/ 5.0</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1 justify-between sm:justify-start">
                            {[0, 1, 2, 3, 4].map((index) => {
                                const displayVal = hoverRating || rating;
                                let starState = 'empty';
                                if (displayVal >= index + 1) starState = 'full';
                                else if (displayVal >= index + 0.5) starState = 'half';
                                
                                return (
                                    <button
                                        key={index}
                                        onMouseMove={(e) => setHoverRating(calculateRating(e, index))}
                                        onClick={(e) => setRating(calculateRating(e, index))}
                                        className="relative w-10 h-10 cursor-pointer outline-none group touch-none"
                                    >
                                        <Star className="absolute inset-0 w-full h-full text-[#333] fill-transparent stroke-[1.5px]" />
                                        <div className={cn("absolute inset-0 overflow-hidden transition-all duration-150", starState === 'half' ? 'w-[50%]' : starState === 'full' ? 'w-full' : 'w-0')}>
                                            <Star className="w-10 h-10 fill-[#D4AF37] stroke-[#D4AF37] stroke-[1.5px]" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col min-h-[100px]">
                        <label className="text-[10px] font-bold text-neutral-500 tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
                            <Edit3 className="w-3 h-3" /> Your Review
                        </label>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Write your thoughts..."
                            className="w-full bg-[#151515] border border-white/10 rounded-lg p-3 text-neutral-200 focus:outline-none focus:border-[#D4AF37]/50 resize-none text-sm leading-relaxed h-[120px]"
                        />
                    </div>
                </div>
            </div>

            {/* 4. FOOTER */}
            <div className="p-5 md:px-8 border-t border-white/10 bg-[#0F0F0F] flex items-center justify-between shrink-0 z-20">
                <button onClick={handleDelete} className="text-red-500/60 hover:text-red-400 font-bold text-[10px] tracking-wider px-3 py-2 flex items-center gap-2 hover:bg-red-500/10 rounded transition-colors whitespace-nowrap">
                  <Trash2 className="w-4 h-4" /> 
                  <span>DELETE</span>
                </button>
                <button onClick={handleSave} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-bold text-xs tracking-widest hover:bg-[#D4AF37] transition-all shadow-lg active:scale-95 whitespace-nowrap">
                  <Save className="w-4 h-4" /> 
                  <span>SAVE CHANGES</span>
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}