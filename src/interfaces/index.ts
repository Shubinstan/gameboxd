export type GameStatus = 'PLAYING' | 'BACKLOG' | 'COMPLETED' | 'DROPPED';

export interface Game {
  id: string;
  title: string;
  releaseYear: number;
  coverUrl: string;
  rating: number;
  status: GameStatus;
  addedAt: number;
  
  platform: string; 
  playedOn?: string; 
  userReview?: string;
  completedAt?: string;
  
  developer?: string; 
}