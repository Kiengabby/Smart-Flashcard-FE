
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommunityTipDTO, CreateTipRequest, TipReactionRequest, TipReactionResponse } from '../interfaces/community-tip.dto';

@Injectable({
  providedIn: 'root'
})
export class CommunityTipService {
  private readonly BASE_API = 'http://localhost:8080/api/community-tips';

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách mẹo học cho một thẻ từ cộng đồng
   */
  getTipsByCard(cardId: number): Observable<CommunityTipDTO[]> {
    console.log('Service: getTipsByCard called with cardId:', cardId);
    const url = `${this.BASE_API}/card/${cardId}`;
    console.log('Service: Making HTTP GET request to:', url);
    const result = this.http.get<CommunityTipDTO[]>(url);
    
    // Add logging to see the response
    result.subscribe({
      next: (response) => console.log('Service: API response received:', response),
      error: (error) => console.error('Service: API error:', error)
    });
    
    return result;
  }

  /**
   * Tạo mẹo học mới
   */
  createTip(request: CreateTipRequest): Observable<CommunityTipDTO> {
    return this.http.post<CommunityTipDTO>(`${this.BASE_API}`, request);
  }

  /**
   * Cập nhật mẹo học
   */
  updateTip(tipId: number, content: string): Observable<CommunityTipDTO> {
    return this.http.put<CommunityTipDTO>(`${this.BASE_API}/${tipId}`, { content });
  }

  /**
   * Xóa mẹo học (chỉ tác giả mới xóa được)
   */
  deleteTip(tipId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_API}/${tipId}`);
  }

  /**
   * Thích/Không thích một mẹo học
   */
  reactToTip(request: TipReactionRequest): Observable<TipReactionResponse> {
    return this.http.post<TipReactionResponse>(`${this.BASE_API}/react`, request);
  }

  /**
   * Lấy top mẹo học được yêu thích nhất
   */
  getTopTips(limit: number = 10): Observable<CommunityTipDTO[]> {
    return this.http.get<CommunityTipDTO[]>(`${this.BASE_API}/top?limit=${limit}`);
  }

  /**
   * Lấy mẹo học của user hiện tại
   */
  getMyTips(): Observable<CommunityTipDTO[]> {
    return this.http.get<CommunityTipDTO[]>(`${this.BASE_API}/my-tips`);
  }
}
