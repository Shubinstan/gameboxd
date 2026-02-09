'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Star, Gamepad2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Game } from '@/types';
import { cn } from '@/lib/utils';

// Configuration for status icons and colors
const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  PLAYING: { icon: <Gamepad2 className="w-3 h-3" />, color: "text-[#D4AF37]" },
  BACKLOG: { icon: <Clock className="w-3 h-3" />, color: "text-neutral-400" },
  COMPLETED: { icon: <CheckCircle2 className="w-3 h-3" />, color: "text-[#D4AF37]" },
  DROPPED: { icon: <XCircle className="w-3 h-3" />, color: "text-red-400" },
  ABANDONED: { icon: <XCircle className="w-3 h-3" />, color: "text-red-400" },
};

interface GameCardProps {
  game: Game;
  disabled?: boolean;
  index?: number;
}

export function GameCard({ game, disabled = false, index }: GameCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || disabled) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Performance optimization: use requestAnimationFrame if possible, 
    // but direct style manipulation is okay here for simplicity.
    cardRef.current.style.setProperty('--rx', `${y * -25}deg`);
    cardRef.current.style.setProperty('--ry', `${x * 25}deg`);
    cardRef.current.style.setProperty('--mx', `${50 + x * 100}%`);
    cardRef.current.style.setProperty('--my', `${50 + y * 100}%`);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--rx', `0deg`);
    cardRef.current.style.setProperty('--ry', `0deg`);
    cardRef.current.style.setProperty('--mx', `50%`);
    cardRef.current.style.setProperty('--my', `50%`);
  };

  const statusInfo = statusConfig[game.status] || statusConfig['DROPPED'] || statusConfig['BACKLOG'];

  // LCP Optimization: 
  const isPriority = index !== undefined && index < 4;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative w-full aspect-[3/4] perspective-1000", 
        disabled ? "cursor-default" : "cursor-pointer"
      )}
      style={{ perspective: '800px' } as React.CSSProperties}
      // Accessibility
      role={disabled ? "article" : "button"}
      aria-label={`View details for ${game.title}`}
    >
      <div
        className="relative h-full w-full transition-transform duration-100 ease-out will-change-transform bg-[#1a1a1a] shadow-2xl rounded-sm"
        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(var(--rx)) rotateY(var(--ry))' }}
      >
        {/* === COVER IMAGE === */}
        <div className="absolute inset-0 z-0 rounded-sm overflow-hidden bg-neutral-900">
           {game.coverUrl ? (
            <Image 
              src={game.coverUrl} 
              alt={`Cover art for ${game.title}`} 
              fill 
              className="object-cover opacity-90 transition-opacity duration-500 group-hover:opacity-100" 

              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              priority={isPriority}
              quality={80} 
            />
           ) : (
             <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-600">
                <span className="sr-only">{game.title}</span> 
                No Cover
             </div>
           )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
        </div>

        {/* === GLARE EFFECT === */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"
          style={{ background: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,0.3) 0%, transparent 60%)' }} />

        {/* === RATING BADGE === */}
        {game.rating > 0 && (
          <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-sm" style={{ transform: 'translateZ(40px)' }}>
            <Star className="w-3 h-3 text-[#D4AF37] fill-transparent stroke-[2px]" />
            <span className="text-[10px] font-bold text-white">{game.rating.toFixed(1)}</span>
          </div>
        )}

        {/* === STATUS BADGE === */}
        <div className="absolute top-2 right-2 z-20 p-1 backdrop-blur-md border border-white/10 rounded-sm shadow-lg bg-black/60" style={{ transform: 'translateZ(30px)' }}>
          <div className={statusInfo.color}>{statusInfo.icon}</div>
        </div>

        {/* === TITLE & INFO === */}
        <div className="absolute bottom-3 left-3 right-3 z-30 transform transition-all duration-300 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100" style={{ transform: 'translateZ(50px)' }}>
          <h3 className="font-rajdhani text-lg font-bold leading-none text-white drop-shadow-md line-clamp-2">
            {game.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[9px] font-bold bg-white/20 px-1 py-0.5 rounded text-white backdrop-blur-sm">
                {game.releaseYear}
             </span>
             <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider truncate max-w-[120px]">
                {game.developer}
             </span>
          </div>
        </div>
        
        {/* === BORDER GLOW === */}
        <div className="absolute inset-0 border border-white/10 group-hover:border-[#D4AF37]/50 transition-colors duration-300 z-40 pointer-events-none rounded-sm" />
      </div>
    </div>
  );
}