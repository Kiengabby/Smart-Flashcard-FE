import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeckMember } from '../interfaces/deck-member.model';

@Injectable({
  providedIn: 'root'
})
export class DeckMemberService {
  private apiUrl = 'http://localhost:8080/api/decks';

  constructor(private http: HttpClient) {}

  /**
   * Get all members of a deck
   */
  getDeckMembers(deckId: number): Observable<DeckMember[]> {
    return this.http.get<DeckMember[]>(`${this.apiUrl}/${deckId}/members`);
  }

  /**
   * Remove a member from deck (owner only)
   */
  removeMember(deckId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${deckId}/members/${userId}`);
  }

  /**
   * Leave a deck (member removes themselves)
   */
  leaveDeck(deckId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${deckId}/leave`, {});
  }

  /**
   * Get all decks where current user is a member
   */
  getMyMemberships(): Observable<DeckMember[]> {
    return this.http.get<DeckMember[]>(`${this.apiUrl}/memberships`);
  }

  /**
   * Get member count for a deck
   */
  getMemberCount(deckId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${deckId}/members/count`);
  }
}
