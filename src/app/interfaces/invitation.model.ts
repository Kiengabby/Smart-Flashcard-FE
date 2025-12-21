// Invitation status enum
export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

// User summary for invitations
export interface UserSummary {
  id: number;
  name: string;
  email: string;
}

// Deck summary for invitations
export interface DeckSummary {
  id: number;
  name: string;
  description?: string;
  cardCount?: number;
}

// Invitation interface
export interface Invitation {
  id: number;
  deck: DeckSummary;
  inviter: UserSummary;
  invitee: UserSummary;
  status: InvitationStatus;
  createdAt: Date;
  respondedAt?: Date;
  expiresAt: Date;
  
  // Legacy fields (kept for backward compatibility)
  deckId: number;
  deckName: string;
  senderId: number;
  senderName: string;
  senderEmail: string;
  receiverEmail: string;
  receiverId?: number;
  receiverName?: string;
}

// Send invitation request
export interface SendInvitationRequest {
  deckId: number;
  receiverEmail: string;
}
