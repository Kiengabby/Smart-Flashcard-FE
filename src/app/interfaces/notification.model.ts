// Notification type enum
export enum NotificationType {
  INVITATION_RECEIVED = 'INVITATION_RECEIVED',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
  CHALLENGE_RECEIVED = 'CHALLENGE_RECEIVED',
  CHALLENGE_ACCEPTED = 'CHALLENGE_ACCEPTED',
  CHALLENGE_REJECTED = 'CHALLENGE_REJECTED',
  CHALLENGE_COMPLETED = 'CHALLENGE_COMPLETED'
}

// Notification interface
export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data: { [key: string]: any };
  isRead: boolean;
  createdAt: string;
}
