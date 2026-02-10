'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, Calendar, Star, Type } from 'lucide-react';
import { Game } from '@/interfaces';
import { GameCard } from '@/components/game/GameCard';
import { cn } from '@/lib/utils';

type SortOption = 'RATING' | 'DATE' | 'ALPHABETICAL';

interface LibraryGridProps {
  initialGames: Game[];
  onAddGameClick: () => void;
  onGameClick: (game: Game) => void;
}

export function LibraryGrid({ initialGames, onAddGameClick, onGameClick }: LibraryGridProps) {
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('DATE');

  const processedGames = useMemo(() => {
    let result = [...initialGames];
    if (filterText) {
      result = result.filter(g => g.title.toLowerCase().includes(filterText.toLowerCase()));
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'RATING': return (b.rating || 0) - (a.rating || 0);
        case 'DATE': return (b.addedAt || 0) - (a.addedAt || 0);
        case 'ALPHABETICAL': return a.title.localeCompare(b.title);
        default: return 0;
      }
    });
    return result;
  }, [initialGames, filterText, sortBy]);

  return (
    <div className="w-full space-y-8">
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 border border-white/10 backdrop-blur-sm rounded-sm">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-[#D4AF37] transition-colors" />
          <input 
            type="text"
            
            aria-label="Filter games by title"
            placeholder="Filter collection..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            
            className="w-full bg-black/40 border border-white/10 pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 placeholder:text-neutral-500 rounded-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1 bg-black/40 p-1 border border-white/10 rounded-sm">
            <SortButton label="Sort by Date" active={sortBy === 'DATE'} onClick={() => setSortBy('DATE')} icon={<Calendar className="w-4 h-4" />} />
            <SortButton label="Sort by Rating" active={sortBy === 'RATING'} onClick={() => setSortBy('RATING')} icon={<Star className="w-4 h-4" />} />
            <SortButton label="Sort Alphabetically" active={sortBy === 'ALPHABETICAL'} onClick={() => setSortBy('ALPHABETICAL')} icon={<Type className="w-4 h-4" />} />
          </div>
          <button 
            onClick={onAddGameClick} 
            aria-label="Open search to add a new game"
            // Accessibility: focus-visible ring
            className="flex items-center gap-2 bg-white text-black px-5 py-2 text-sm font-bold hover:bg-[#D4AF37] transition-colors hover:shadow-[0_0_15px_#D4AF37] rounded-sm uppercase tracking-wider focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Game</span>
          </button>
        </div>
      </div>

      {/* GAMES GRID */}
      {processedGames.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-20">
          {processedGames.map((game, i) => (
            
            <div 
                key={game.id} 
                onClick={() => onGameClick(game)} 
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onGameClick(game);
                    }
                }}
                tabIndex={0} 
                className="fade-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-sm"
            > 
              <GameCard game={game} index={i} />
            </div>
          ))}
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-neutral-500 gap-4 border border-dashed border-white/10 rounded-sm bg-white/5">
          <Search className="w-10 h-10 opacity-20" />
          <p className="font-rajdhani uppercase tracking-widest text-lg">No games found</p>
        </div>
      )}
    </div>
  );
}

function SortButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
        onClick={onClick} 
        aria-label={label}
        title={label}
        // Accessibility: focus ring
        className={cn(
            "p-2 transition-all duration-200 rounded-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]", 
            active ? "bg-white/10 text-[#D4AF37]" : "text-neutral-500 hover:text-white"
        )}
    >
      {icon}
    </button>
  );
}