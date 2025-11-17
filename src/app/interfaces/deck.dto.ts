export interface DeckDTO {
  id: number;
  name: string;
  description: string;
  language?: string;
  cardCount?: number;
  progress?: number; // Progress percentage (0-100)
  lastStudied?: string; // Last study date
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export interface CreateDeckRequest {
  name: string;
  description: string;
  language: string;
}

export interface UpdateDeckRequest {
  name?: string;
  description?: string;
  language?: string;
}
