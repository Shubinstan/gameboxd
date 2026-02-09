'use client';

import { useState, useEffect } from 'react';
import { X, Save, MapPin, User, Loader2 } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/features/auth/AuthContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentLocation: string;
  onUpdate: (newName: string, newLocation: string) => void;
}


const GAMER_CITIES = [
  "Raccoon City", "Silent Hill", "Los Santos", "Night City", 
  "Novigrad", "Whiterun", "City 17", "Rapture", "Midgar", 
  "Yharnam", "Vice City", "New Vegas"
];

export function EditProfileModal({ isOpen, onClose, currentName, currentLocation, onUpdate }: EditProfileModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState(currentName);
  const [location, setLocation] = useState(currentLocation);
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(currentName);
    
    if (currentLocation && !GAMER_CITIES.includes(currentLocation)) {
        setIsCustomLocation(true);
        setLocation(currentLocation);
    } else {
        setLocation(currentLocation || GAMER_CITIES[0]);
    }
  }, [currentName, currentLocation, isOpen]);

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // 1. Update Display Name в Auth
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }

      // 2. Updating Location in Firestore (creating a user document)
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { location }, { merge: true });

      onUpdate(name, location);
      onClose();
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white font-rajdhani uppercase tracking-wider">Edit Profile</h2>
            <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="space-y-6">
            {/* NAME INPUT */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3 h-3" /> Display Name
                </label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-3 rounded-lg text-sm focus:border-[#D4AF37] outline-none transition-colors"
                />
            </div>

            {/* LOCATION SELECTOR */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Location (City)
                </label>
                
                {!isCustomLocation ? (
                    <div className="grid grid-cols-2 gap-2">
                        <select 
                            value={location}
                            onChange={(e) => {
                                if (e.target.value === 'custom') setIsCustomLocation(true);
                                else setLocation(e.target.value);
                            }}
                            className="col-span-2 bg-[#1A1A1A] border border-white/10 text-white px-4 py-3 rounded-lg text-sm focus:border-[#D4AF37] outline-none cursor-pointer appearance-none"
                        >
                            {GAMER_CITIES.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                            <option value="custom" className="text-[#D4AF37] font-bold">+ Enter Custom City...</option>
                        </select>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Enter your city..."
                            className="flex-1 bg-[#1A1A1A] border border-white/10 text-white px-4 py-3 rounded-lg text-sm focus:border-[#D4AF37] outline-none"
                            autoFocus
                        />
                        <button 
                            onClick={() => setIsCustomLocation(false)}
                            className="px-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            List
                        </button>
                    </div>
                )}
            </div>

            <button 
                onClick={handleSave}
                disabled={isLoading}
                className="w-full bg-[#D4AF37] hover:bg-[#FCD34D] text-black font-bold py-3 rounded-lg mt-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
}