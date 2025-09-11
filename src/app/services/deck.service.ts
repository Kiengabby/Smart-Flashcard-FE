import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, orderBy } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface Deck {
  id?: string;
  name: string;
  description: string;
  cardCount: number;
  ownerId: string;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  private firestore: Firestore;
  private auth: Auth;

  constructor() {
    this.firestore = inject(Firestore);
    this.auth = inject(Auth);
  }

  /**
   * Tạo một bộ thẻ mới
   */
  async createDeck(deckData: { name: string; description: string }): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      const newDeck: Omit<Deck, 'id'> = {
        name: deckData.name,
        description: deckData.description,
        cardCount: 0,
        ownerId: currentUser.uid,
        createdAt: new Date()
      };

      const decksCollection = collection(this.firestore, 'decks');
      await addDoc(decksCollection, newDeck);
      console.log('Tạo bộ thẻ thành công!');
    } catch (error) {
      console.error('Lỗi khi tạo bộ thẻ:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả bộ thẻ của người dùng hiện tại
   */
  getDecksForCurrentUser(): Observable<Deck[]> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      throw new Error('Người dùng chưa đăng nhập');
    }

    const decksCollection = collection(this.firestore, 'decks');
    const q = query(
      decksCollection,
      where('ownerId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    return collectionData(q, { idField: 'id' }) as Observable<Deck[]>;
  }
}
