'use client';


import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  MapPin, Link as LinkIcon, BarChart3, Activity, 
  Star, Edit3, Bookmark, Calendar, Plus, Search, 
  RefreshCw, Link2, Pencil
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/features/auth/AuthContext';
import { LibraryService } from '@/features/library/LibraryService';
import { Game, GameStatus } from '@/interfaces';
import { GameDetailsModal } from '@/components/game/GameDetailsModal';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 
import { db } from '@/lib/firebase/config';
import { SearchModal } from '@/components/search/SearchModal';
import { EditProfileModal } from '@/components/profile/EditProfileModal'; 


const formatDate = (dateString?: string | number) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

const normalizePlatform = (raw: string) => {
    if (!raw) return 'Unknown';
    if (raw.includes('PlayStation 5') || raw === 'PS5') return 'PS5';
    if (raw.includes('PlayStation 4') || raw === 'PS4') return 'PS4';
    if (raw.includes('Xbox Series') || raw.includes('Series X')) return 'Xbox Series';
    if (raw.includes('Switch')) return 'Nintendo Switch';
    if (raw.includes('PC') || raw.includes('Windows')) return 'PC';
    return raw;
};

type TabType = 'profile' | 'activity' | 'wishlist' | 'reviews';
const TABS: TabType[] = ['profile', 'activity', 'wishlist', 'reviews'];
const AVATAR_STYLES = ['notionists', 'pixel-art', 'bottts', 'avataaars'];

export default function ProfilePage() {
 
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [location, setLocation] = useState("Gamer City");
  
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchContext, setSearchContext] = useState<'general' | 'wishlist'>('general');
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const initialTab = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(initialTab && TABS.includes(initialTab) ? initialTab : 'profile');

  
   useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && TABS.includes(tabFromUrl as TabType)) {
        setActiveTab(tabFromUrl as TabType);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadUserProfile() {
      if (user) {
        setAvatarSrc(user.photoURL);
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().location) {
                setLocation(userDoc.data().location);
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        }
      }
    }
    loadUserProfile();
  }, [user]);

  const handleTabChange = (tab: TabType) => {
      setActiveTab(tab);
      router.push(`/profile?tab=${tab}`, { scroll: false });
  };

  useEffect(() => {
    async function loadData() {
      if (user) {
        try {
          const userGames = await LibraryService.getUserLibrary(user.uid);
          setGames(userGames);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    }
    loadData();
  }, [user]);

  const stats = useMemo(() => {
    const wishlist = games.filter(g => g.status === 'BACKLOG');
    const collection = games.filter(g => g.status !== 'BACKLOG');
    const total = collection.length;
    const thisYear = collection.filter(g => {
        const d = new Date(g.addedAt || Date.now());
        return d.getFullYear() === new Date().getFullYear();
    }).length;
    const favorites = [...collection].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
    const ratingsDist = Array(10).fill(0);
collection.forEach(g => {
     const r = g.rating || 0; 
     if (r > 0) {
         const index = Math.ceil(r * 2) - 1;
         if (index >= 0 && index < 10) ratingsDist[index]++;
     }
});
    const maxRatingCount = Math.max(...ratingsDist, 1);
    const platforms: Record<string, number> = {};
    collection.forEach(g => {
        const rawPlatform = g.playedOn || g.platform || 'Unknown';
        const p = normalizePlatform(rawPlatform);
        platforms[p] = (platforms[p] || 0) + 1;
    });
    const topPlatforms = Object.entries(platforms)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4)
        .map(([name, count]) => ({ name, count, percent: Math.round((count / total) * 100) }));
    const reviews = collection.filter(g => g.userReview && g.userReview.length > 0);
    return { total, thisYear, favorites, wishlist, collection, ratingsDist, maxRatingCount, topPlatforms, reviews };
  }, [games]);

  const handleRandomizeAvatar = async () => {
      if (!user) return;
      const randomStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
      const randomSeed = Math.random().toString(36).substring(7);
      const newAvatarUrl = `https://api.dicebear.com/9.x/${randomStyle}/svg?seed=${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
      setAvatarSrc(newAvatarUrl);
      setIsAvatarMenuOpen(false);
      try {
          await updateProfile(user, { photoURL: newAvatarUrl });
          setTimeout(() => window.location.reload(), 500);
      } catch (error) {
          alert("Could not update avatar");
          setAvatarSrc(user.photoURL); 
      }
  };

  const handleLinkAvatar = async () => {
      if (!user) return;
      const url = prompt("Paste the image URL:");
      if (!url) return;
      setAvatarSrc(url);
      setIsAvatarMenuOpen(false);
      try {
          await updateProfile(user, { photoURL: url });
          setTimeout(() => window.location.reload(), 500);
      } catch (error) {
          alert("Could not update avatar");
          setAvatarSrc(user.photoURL);
      }
  };

  const handleProfileUpdate = (newName: string, newLocation: string) => {
      setLocation(newLocation);
      if (user) window.location.reload(); 
  };

  const openSearch = (context: 'general' | 'wishlist') => {
      setSearchContext(context);
      setIsSearchOpen(true);
  };

  const handleAddGame = async (newGame: Game) => {
    if (!user) return;
const statusToAdd = (searchContext === 'wishlist' ? 'BACKLOG' : 'PLAYING') as GameStatus;
const gameToAdd = { ...newGame, status: statusToAdd };
    setGames(prev => [gameToAdd, ...prev]);
    await LibraryService.addGame(user.uid, gameToAdd);
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

  if (!user) return <div className="min-h-screen bg-[#14181c]" />;

  return (
    <div className="min-h-screen bg-[#14181c] text-white font-sans pb-20">
      <Navbar />

      {/* HEADER BANNER */}
      <div className="h-48 md:h-64 w-full bg-[#0F0F0F] relative overflow-hidden group">
         {stats.favorites[0] ? (
             <Image src={stats.favorites[0].coverUrl} alt="Banner" fill className="object-cover opacity-20 blur-sm group-hover:blur-0 transition-all duration-700" />
         ) : (
             <div className="absolute inset-0 bg-gradient-to-r from-[#14181c] to-[#1a1a1a]" />
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] via-[#14181c]/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-8 -mt-24 md:-mt-32 relative z-10">
        
        {/* PROFILE HEADER: STACK ON MOBILE */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 md:mb-10 pb-8 border-b border-white/10">
            
            {/* AVATAR */}
            <div className="relative group shrink-0">
                <div 
                    onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                    className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-[#14181c] overflow-hidden shadow-2xl bg-[#202020] relative cursor-pointer"
                >
                    {avatarSrc ? (
                        <img src={avatarSrc} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-neutral-600 bg-neutral-900">
                            {user.displayName?.[0]}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                        <Edit3 className="w-8 h-8 text-white" />
                    </div>
                </div>

                {isAvatarMenuOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={handleRandomizeAvatar} className="w-full text-left px-4 py-3 text-sm text-neutral-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                            <RefreshCw className="w-4 h-4" /> <span>Randomize Art</span>
                        </button>
                        <button onClick={handleLinkAvatar} className="w-full text-left px-4 py-3 text-sm text-neutral-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors border-t border-white/5">
                            <Link2 className="w-4 h-4" /> <span>Paste Image URL</span>
                        </button>
                    </div>
                )}
                {isAvatarMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setIsAvatarMenuOpen(false)} />}
            </div>

            {/* INFO */}
            <div className="flex-1 text-center md:text-left mb-2 md:mb-0">
                <div className="flex items-center justify-center md:justify-start gap-3">
                    <h1 className="text-2xl md:text-4xl font-black text-white font-rajdhani tracking-tight">
                        {user.displayName}
                    </h1>
                    <span className="px-2 py-0.5 bg-[#D4AF37] text-black text-[10px] font-bold rounded uppercase tracking-wider shadow-[0_0_10px_rgba(212,175,55,0.4)]">Pro</span>
                    <button 
                        onClick={() => setIsEditProfileOpen(true)}
                        className="p-1.5 md:p-2 text-neutral-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
                    >
                        <Pencil className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 mt-2 text-xs md:text-sm text-neutral-400 font-medium">
                    <span className="flex items-center gap-1 text-white/80">
                        <MapPin className="w-3 h-3 text-[#D4AF37]" /> {location}
                    </span>
                    <span className="hidden md:flex items-center gap-1 hover:text-[#D4AF37] cursor-pointer transition-colors">
                        <LinkIcon className="w-3 h-3" /> gameboxd.com/{user.uid.slice(0,8)}
                    </span>
                </div>
            </div>

            {/* STATS: GRID ON MOBILE */}
            <div className="w-full md:w-auto grid grid-cols-3 gap-2 md:flex md:gap-8 text-center md:text-right border-t border-white/10 md:border-0 pt-4 md:pt-0">
                <div className="group"><div className="text-xl md:text-2xl font-black text-white group-hover:text-[#D4AF37] transition-colors">{stats.total}</div><div className="text-[9px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Games</div></div>
                <div className="group"><div className="text-xl md:text-2xl font-black text-white group-hover:text-[#D4AF37] transition-colors">{stats.wishlist.length}</div><div className="text-[9px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Wishlist</div></div>
                <div className="group"><div className="text-xl md:text-2xl font-black text-white group-hover:text-[#D4AF37] transition-colors">{stats.reviews.length}</div><div className="text-[9px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Reviews</div></div>
            </div>
        </div>

        {/* TABS SCROLLABLE */}
        <div className="flex items-center gap-1 mb-8 border-b border-white/10 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {TABS.map((tab) => (
                <button key={tab} onClick={() => handleTabChange(tab)} className={`px-4 md:px-6 py-3 text-xs md:text-sm font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? "border-[#D4AF37] text-white" : "border-transparent text-neutral-500 hover:text-white hover:border-white/20"}`}>
                    {tab}
                </button>
            ))}
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
            <div className="space-y-12">
                
                {activeTab === 'profile' && (
                    <>
                        <section>
                            <div className="flex items-end justify-between mb-4 border-b border-white/10 pb-2"><h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Favorite Games</h3></div>
                            {/* FAVORITES GRID: 2 COL ON MOBILE, 4 ON DESKTOP */}
                            {stats.favorites.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                    {stats.favorites.map((game) => (
                                        <div key={game.id} onClick={() => setSelectedGame(game)} className="cursor-pointer transition-transform hover:scale-105">
                                            <div className="aspect-[3/4] relative rounded-sm overflow-hidden shadow-lg border border-white/5">
                                                <Image src={game.coverUrl} alt={game.title} fill className="object-cover" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (<p className="text-neutral-500 text-sm">No highly rated games in collection.</p>)}
                        </section>
                        
                        <section>
                            <div className="flex items-end justify-between mb-4 border-b border-white/10 pb-2"><h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Recent Collection</h3></div>
                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {stats.collection.slice(0, 5).map((game) => (
                                    <div key={game.id} onClick={() => setSelectedGame(game)} className="w-[80px] md:w-[100px] shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                                        <div className="aspect-[3/4] relative rounded-sm overflow-hidden mb-2">
                                            <Image src={game.coverUrl} alt={game.title} fill className="object-cover" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {/* WISHLIST GRID: 3 COL ON MOBILE */}
                {activeTab === 'wishlist' && (
                     <section>
                     <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-2">
                         <h3 className="text-xs md:text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                             <Bookmark className="w-4 h-4" /> Wishlist
                         </h3>
                         <button onClick={() => openSearch('wishlist')} className="flex items-center gap-1 text-[10px] font-bold bg-[#D4AF37] text-black px-3 py-1.5 rounded hover:bg-[#FCD34D] transition-colors uppercase tracking-widest">
                             <Plus className="w-3 h-3" /> Add Game
                         </button>
                     </div>
                     {stats.wishlist.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 animate-in fade-in">
                             {stats.wishlist.map((game) => (
                                 <div key={game.id} onClick={() => setSelectedGame(game)} className="cursor-pointer transition-transform hover:scale-105 group relative">
                                     <div className="aspect-[3/4] relative rounded-sm overflow-hidden shadow-lg border border-white/5">
                                         <Image src={game.coverUrl} alt={game.title} fill className="object-cover" />
                                     </div>
                                 </div>
                             ))}
                         </div>
                     ) : (
                         <div className="flex flex-col items-center justify-center py-10 md:py-20 text-neutral-500 border-2 border-dashed border-white/10 rounded-lg bg-white/[0.02]">
                             <Bookmark className="w-10 h-10 md:w-12 md:h-12 mb-4 opacity-20 text-white" />
                             <h4 className="text-base md:text-lg font-bold text-white mb-2">Wishlist is empty</h4>
                             <button onClick={() => openSearch('wishlist')} className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#FCD34D] text-black font-bold py-3 px-6 rounded-md uppercase tracking-widest text-xs transition-transform hover:scale-105 shadow-lg shadow-[#D4AF37]/20">
                                 <Search className="w-4 h-4" /> Find a Game
                             </button>
                         </div>
                     )}
                 </section>
                )}
                
                
                 {activeTab === 'activity' && (
                    <section>
                        <div className="bg-[#1a1e23] rounded-lg border border-white/5 overflow-hidden overflow-x-auto">
                            <table className="w-full text-sm text-left min-w-[500px]"> 
                                {/* min-w makes the table scroll horizontally without breaking the layout */}
                                <thead className="bg-[#20242b] text-neutral-500 uppercase text-[10px] font-bold tracking-widest">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3 w-full">Game</th>
                                        <th className="px-4 py-3">Platform</th>
                                        <th className="px-4 py-3 text-right">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-neutral-300">
                                    {stats.collection.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)).map((game) => (
                                        <tr key={game.id} onClick={() => setSelectedGame(game)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                                            <td className="px-4 py-3 font-mono text-neutral-500 text-xs whitespace-nowrap">{formatDate(game.completedAt || game.addedAt)}</td>
                                            <td className="px-4 py-3 flex items-center gap-3">
                                                <div className="w-8 h-10 relative rounded-sm overflow-hidden opacity-80 group-hover:opacity-100 shrink-0">
                                                    <Image src={game.coverUrl} alt="cover" fill className="object-cover" />
                                                </div>
                                                <span className="font-bold text-white group-hover:text-[#D4AF37] transition-colors block">{game.title}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-neutral-400">{normalizePlatform(game.playedOn || game.platform || '')}</td>
                                            <td className="px-4 py-3 text-right">
                                                {game.rating > 0 && (<div className="flex justify-end text-[#D4AF37] gap-0.5 items-center"><Star className="w-3 h-3 fill-current" /><span className="text-xs font-bold ml-1">{game.rating}</span></div>)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activeTab === 'reviews' && (
                    <div className="space-y-4">
                        {stats.reviews.length > 0 ? stats.reviews.map((game) => (
                            <div key={game.id} onClick={() => setSelectedGame(game)} className="flex flex-col md:flex-row gap-4 bg-[#1a1e23] p-4 md:p-6 rounded-lg border border-white/5 hover:border-[#D4AF37]/30 transition-colors cursor-pointer group">
                                <div className="w-[80px] shrink-0 mx-auto md:mx-0">
                                    <div className="aspect-[3/4] relative rounded-sm overflow-hidden shadow-md">
                                        <Image src={game.coverUrl} alt="Game" fill className="object-cover" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-white text-lg md:text-xl font-rajdhani group-hover:text-[#D4AF37] transition-colors">{game.title}</h4>
                                        <div className="flex text-[#D4AF37] items-center gap-1"><Star className="w-4 h-4 fill-current" /><span className="font-bold">{game.rating}</span></div>
                                    </div>
                                    <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap font-sans border-l-2 border-white/10 pl-4">{game.userReview}</p>
                                </div>
                            </div>
                        )) : (<div className="text-center py-20 text-neutral-500"><Edit3 className="w-10 h-10 mx-auto mb-4 opacity-20" /><p>You haven't written any reviews yet.</p></div>)}
                    </div>
                )}
            </div>


            <div className="space-y-10">
                 <section>
                    <div className="flex items-end justify-between mb-4 border-b border-white/10 pb-2"><h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Ratings</h3></div>
                    <div className="h-32 flex items-end gap-1 px-2 border-b border-neutral-700/50 relative pt-4">
                        {stats.ratingsDist.map((count, i) => {
                            const heightPercent = count > 0 ? (count / stats.maxRatingCount) * 100 : 0;
                            return (
                                <div key={i} className="flex-1 group relative h-full flex items-end">
                                    <div className="bg-[#2c3440] hover:bg-[#D4AF37] w-full rounded-t-sm transition-all duration-300 relative z-10 min-h-[2px]" style={{ height: `${heightPercent}%` }} />
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-600 mt-2 font-mono"><span>0.5</span><span>2.5</span><span>5.0</span></div>
                </section>
                <section>
                    <div className="flex items-end justify-between mb-4 border-b border-white/10 pb-2"><h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4" /> Top Platforms</h3></div>
                    <div className="space-y-3">
                        {stats.topPlatforms.map((p) => (
                            <div key={p.name} className="group cursor-default">
                                <div className="flex justify-between text-xs text-neutral-400 mb-1 group-hover:text-white transition-colors"><span className="font-bold">{p.name}</span><span>{p.count}</span></div>
                                <div className="h-2 w-full bg-[#20242b] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#455060] group-hover:bg-[#D4AF37] transition-all duration-500 rounded-full" style={{ width: `${p.percent}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
      </div>

      <GameDetailsModal isOpen={!!selectedGame} game={selectedGame} onClose={() => setSelectedGame(null)} onUpdate={handleUpdateGame} onDelete={handleDeleteGame} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onAddGame={handleAddGame} />
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} currentName={user.displayName || ''} currentLocation={location} onUpdate={handleProfileUpdate} />
    </div>
  );
}