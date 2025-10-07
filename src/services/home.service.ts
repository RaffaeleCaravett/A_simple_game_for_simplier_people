import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../core/environment';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private stats: string = '/stats';
  private auth: string = '/auth';
  private giocoPrevies = '/gamePreview';
  constructor(private http: HttpClient) { }

  getStats() {
    return this.http.get(environment.API_URL + this.auth + this.stats);
  }
  getGiocoPreview() {
    return this.http.get(environment.API_URL + this.auth + this.giocoPrevies);
  }
}
