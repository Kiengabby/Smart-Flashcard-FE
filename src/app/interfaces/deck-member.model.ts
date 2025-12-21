// Member role enum
export enum MemberRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER'
}

// Deck member interface
export interface DeckMember {
  id: number;
  deckId: number;
  deckName: string;
  userId: number;
  userName: string;
  userEmail: string;
  role: MemberRole;
  joinedAt: string;
}
