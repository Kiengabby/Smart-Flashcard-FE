export interface DeckDTO {
  id: string;
  name: string;
  description: string;
  cardCount?: number;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export interface CreateDeckRequest {
  name: string;
  description: string;
}

export interface UpdateDeckRequest {
  name?: string;
  description?: string;
}
