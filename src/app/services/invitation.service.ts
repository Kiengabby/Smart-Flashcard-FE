import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  Invitation, 
  SendInvitationRequest 
} from '../interfaces/invitation.model';

// Response wrappers from backend
interface InvitationResponse {
  success: boolean;
  invitation?: Invitation;
  invitations?: Invitation[];
  total?: number;
  message?: string;
}

interface CountResponse {
  success: boolean;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private apiUrl = 'http://localhost:8080/api/invitations';

  constructor(private http: HttpClient) {}

  /**
   * Transform backend response to frontend model
   * Backend uses flat structure, frontend uses nested objects
   */
  private transformInvitation(data: any): Invitation {
    console.log('🔄 Transforming invitation:', data);
    const transformed = {
      ...data,
      deck: {
        id: data.deckId,
        name: data.deckName,
        description: data.deckDescription || '',
        cardCount: data.cardCount || 0
      },
      inviter: {
        id: data.senderId,
        name: data.senderName,
        email: data.senderEmail
      },
      invitee: {
        id: data.receiverId || 0,
        name: data.receiverName || '',
        email: data.receiverEmail
      },
      createdAt: new Date(data.createdAt),
      respondedAt: data.respondedAt ? new Date(data.respondedAt) : undefined,
      expiresAt: new Date(data.expiresAt)
    };
    console.log('✅ Transformed result:', transformed);
    return transformed;
  }

  /**
   * Transform array of invitations
   */
  private transformInvitations(data: any[]): Invitation[] {
    return data.map(item => this.transformInvitation(item));
  }

  /**
   * Send invitation to join deck (overloaded for convenience)
   */
  sendInvitation(deckId: number, email: string): Observable<Invitation>;
  sendInvitation(request: SendInvitationRequest): Observable<Invitation>;
  sendInvitation(deckIdOrRequest: number | SendInvitationRequest, email?: string): Observable<Invitation> {
    const request: SendInvitationRequest = typeof deckIdOrRequest === 'number'
      ? { deckId: deckIdOrRequest, receiverEmail: email! }
      : deckIdOrRequest;
    return this.http.post<InvitationResponse>(`${this.apiUrl}/send`, request)
      .pipe(map(response => this.transformInvitation(response.invitation!)));
  }

  /**
   * Accept invitation
   */
  acceptInvitation(invitationId: number): Observable<Invitation> {
    return this.http.post<InvitationResponse>(`${this.apiUrl}/${invitationId}/accept`, {})
      .pipe(map(response => this.transformInvitation(response.invitation!)));
  }

  /**
   * Reject invitation
   */
  rejectInvitation(invitationId: number): Observable<Invitation> {
    return this.http.post<InvitationResponse>(`${this.apiUrl}/${invitationId}/reject`, {})
      .pipe(map(response => this.transformInvitation(response.invitation!)));
  }

  /**
   * Respond to invitation (accept or reject)
   */
  respondToInvitation(invitationId: number, accept: boolean): Observable<Invitation> {
    return accept ? this.acceptInvitation(invitationId) : this.rejectInvitation(invitationId);
  }

  /**
   * Get received invitations
   */
  getReceivedInvitations(): Observable<Invitation[]> {
    return this.http.get<InvitationResponse>(`${this.apiUrl}/received`)
      .pipe(
        map(response => {
          console.log('📥 Raw backend response:', response);
          const transformed = this.transformInvitations(response.invitations || []);
          console.log('✨ Transformed invitations:', transformed);
          return transformed;
        })
      );
  }

  /**
   * Get all my invitations (alias for getReceivedInvitations)
   */
  getMyInvitations(): Observable<Invitation[]> {
    return this.getReceivedInvitations();
  }

  /**
   * Get sent invitations
   */
  getSentInvitations(): Observable<Invitation[]> {
    return this.http.get<InvitationResponse>(`${this.apiUrl}/sent`)
      .pipe(map(response => this.transformInvitations(response.invitations || [])));
  }

  /**
   * Get invitation by ID
   */
  getInvitationById(invitationId: number): Observable<Invitation> {
    return this.http.get<InvitationResponse>(`${this.apiUrl}/${invitationId}`)
      .pipe(map(response => this.transformInvitation(response.invitation!)));
  }

  /**
   * Get pending invitations count
   */
  getPendingCount(): Observable<number> {
    return this.http.get<CountResponse>(`${this.apiUrl}/pending/count`)
      .pipe(map(response => response.count));
  }
}
