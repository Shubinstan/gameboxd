export type GameStatus = 'PLAYING' | 'BACKLOG' | 'COMPLETED' | 'DROPPED';

export interface Game {
  id: string;
  title: string;
  coverUrl: string;
  
  
  releaseYear?: number;
  rating?: number;
  status?: GameStatus;
  addedAt?: number;
  
  
  summary?: string;      
  description?: string;  
  developer?: string;
  publisher?: string;
  

  platform?: string;
  playedOn?: string;
  completedAt?: string;
  userReview?: string;
}