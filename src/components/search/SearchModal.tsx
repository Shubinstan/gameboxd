'use client';

import { useState, useEffect } from 'react';
import { X, Search, Loader2, Plus, Check, ArrowLeft, Gamepad2 } from 'lucide-react';
import { Game } from '@/types';
import { GameCard } from '@/components/game/GameCard';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGame: (game: Game) => void;
}

export function SearchModal({ isOpen, onClose, onAddGame }: SearchModalProps) {
  // === STATE ===
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewGame, setPreviewGame] = useState<Game | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // === RESET EFFECT ===
  useEffect(() => {
    if (!isOpen) {
        setQuery('');
        setResults([]);
        setPreviewGame(null);

        setAddedIds(new Set());
    }
  }, [isOpen]);

  // === SEARCH EFFECT (DEBOUNCED) ===
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) return; 
      
      setLoading(true);
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        setResults(data.games || []);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 500); 

    return () => clearTimeout(timer);
  }, [query]);

  // Handler to add game and update UI
  const handleAdd = (game: Game) => {
    onAddGame(game);
    setAddedIds(prev => new Set(prev).add(game.id));
  };

  if (!isOpen) return null;

  return (
    // MAIN LAYOUT
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      
      {/* BACKDROP */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* MODAL CARD */}
      <div className="relative w-full max-w-5xl h-[600px] md:h-[80vh] max-h-[85dvh] bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden rounded-xl">
        
        {/* === HEADER === */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-black/50 shrink-0 relative z-10">
          {previewGame ? (
            <button 
                onClick={() => setPreviewGame(null)}
                className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group mr-auto"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-rajdhani font-bold uppercase tracking-wider text-sm">Back</span>
            </button>
          ) : (
            <>
                <Search className="w-5 h-5 text-neutral-500 shrink-0" />
                <input
                    autoFocus
                    type="text"
                    placeholder="SEARCH GAMES..."
                    className="flex-1 bg-transparent text-lg font-rajdhani font-bold text-white placeholder:text-neutral-700 focus:outline-none uppercase min-w-0"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </>
          )}
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0 ml-2"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* === CONTENT AREA === */}
        <div className="flex-1 overflow-hidden relative bg-[#050505]">
            
            {previewGame ? (
                // === VIEW 1: PREVIEW ===
                <div className="h-full flex flex-col md:flex-row animate-in slide-in-from-right-10 fade-in duration-300 overflow-y-auto custom-scrollbar">
                    {/* Cover Art */}
                    <div className="w-full md:w-1/3 bg-black/20 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10 shrink-0">
                        <div className="w-[140px] md:w-[240px] shadow-2xl shadow-black rotate-0 md:rotate-1 transition-transform">
                            <GameCard game={previewGame} disabled />
                        </div>
                    </div>
                    
                    {/* Game Info */}
                    <div className="w-full md:w-2/3 p-6 pb-20 md:pb-6">
                        <h2 className="text-2xl md:text-4xl font-rajdhani font-black text-white uppercase leading-none mb-4 break-words">
                            {previewGame.title}
                        </h2>
                        
                        <div className="flex flex-wrap items-center gap-3 text-neutral-400 mb-6 font-mono text-xs">
                            <span className="bg-white/10 px-2 py-1 rounded text-white">{previewGame.releaseYear}</span>
                            <span>{previewGame.platform}</span>
                            {previewGame.rating > 0 && (
                                <span className="flex items-center gap-1 text-[#4ade80]">
                                    <Gamepad2 className="w-4 h-4" /> {previewGame.rating}
                                </span>
                            )}
                        </div>

                        <p className="text-neutral-300 text-sm md:text-base leading-relaxed mb-8">
                            {previewGame.description || previewGame.summary || "No description available."}
                        </p>

                        <button 
                            onClick={() => handleAdd(previewGame)}
                            disabled={addedIds.has(previewGame.id)}
                            className={`
                                w-full md:w-auto flex items-center justify-center gap-3 px-6 py-4 font-bold text-sm tracking-widest uppercase transition-all rounded-lg
                                ${addedIds.has(previewGame.id) 
                                    ? "bg-green-900/50 text-green-400 cursor-default border border-green-500/30" 
                                    : "bg-[#4ade80] text-black hover:scale-105 active:scale-95 shadow-lg"
                                }
                            `}
                        >
                            {addedIds.has(previewGame.id) ? (
                                <><Check className="w-5 h-5" /> Added</>
                            ) : (
                                <><Plus className="w-5 h-5" /> Add to Collection</>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                // === VIEW 2: GRID ===
                <div className="h-full overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                            <p className="font-rajdhani tracking-widest animate-pulse text-xs">SEARCHING...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-4">
                            {results.map((game) => (
                                <div key={game.id} className="group relative">
                                    <div onClick={() => setPreviewGame(game)} className="cursor-pointer active:scale-95 transition-transform">
                                        <GameCard game={game} disabled />
                                    </div>
                                    
                                    {/* Quick Add Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAdd(game);
                                        }}
                                        className={`
                                            absolute top-2 right-2 z-30 p-2 rounded-full shadow-lg border backdrop-blur-md transition-all
                                            ${addedIds.has(game.id)
                                                ? "bg-[#4ade80] border-[#4ade80] text-black"
                                                : "bg-black/60 border-white/20 text-white hover:bg-[#D4AF37] hover:text-black"
                                            }
                                        `}
                                    >
                                        {addedIds.has(game.id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : query.length > 0 ? (
                        <div className="h-full flex items-center justify-center text-neutral-600 font-rajdhani">
                            NO SIGNALS
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 select-none px-4 text-center">
                            <Gamepad2 className="w-16 h-16 mb-4" />
                            <p className="font-rajdhani text-xl font-bold uppercase">Enter Query</p>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}