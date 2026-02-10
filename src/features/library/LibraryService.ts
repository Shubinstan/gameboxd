import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Game } from '@/interfaces';


const COLLECTION_NAME = 'games';

export const LibraryService = {

  async addGame(userId: string, game: Game) {
    try {
      
      const docId = `${userId}_${game.id}`;
      const gameRef = doc(db, COLLECTION_NAME, docId);
      
      
      await setDoc(gameRef, {
        ...game,
        userId,
        addedAt: Date.now() 
      });
      
      console.log('Game saved to Firestore');
    } catch (error) {
      console.error('Error adding game:', error);
      throw error;
    }
  },

 
  async getUserLibrary(userId: string): Promise<Game[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      const games: Game[] = [];
      
      querySnapshot.forEach((doc) => {
        
        const data = doc.data();
        games.push(data as Game);
      });
      
      return games;
    } catch (error) {
      console.error('Error fetching library:', error);
      return [];
    }
  },


  async updateGame(userId: string, gameId: string, updates: Partial<Game>) {
    try {
      const docId = `${userId}_${gameId}`;
      const gameRef = doc(db, COLLECTION_NAME, docId);
      await updateDoc(gameRef, updates);
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  },


  async removeGame(userId: string, gameId: string) {
    try {
      const docId = `${userId}_${gameId}`;
      await deleteDoc(doc(db, COLLECTION_NAME, docId));
    } catch (error) {
      console.error('Error removing game:', error);
      throw error;
    }
  }
};