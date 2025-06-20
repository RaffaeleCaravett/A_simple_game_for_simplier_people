import { Injectable } from '@angular/core';
import { AuthGuard } from '../core/auth.guard';
import { BehaviorSubject } from 'rxjs';
import { User } from '../interfaces/interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../core/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public isAuthenticatedUser: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private token: string = '';
  private user!: User | null;
  private userUrl:string = '/user'
  private auth: string = '/auth'
  private accessToken: string = '/verifyToken'
  private refreshToken: string = '/verifyRefreshToken'

  constructor(private authGuard: AuthGuard, private http: HttpClient) { }

  authenticateUser(bool: boolean) {
    this.authGuard.isAuthenticated = bool;
    this.isAuthenticatedUser.next(bool);
  }
  getToken() {
    return this.token;
  }
  setToken(token: string) {
    this.token = token;
  }
  getUser() {
    return this.user;
  }
  setUser(user: User | null) {
    this.user = user;
  }
  verifyAccessToken(token: string) {
    return this.http.get(environment.API_URL + this.auth + this.accessToken + `?token=${token}`)
  }
  verifyRefreshToken(refreshToken: string) {
    return this.http.get(environment.API_URL + this.auth + this.refreshToken + `?refreshToken=${refreshToken}`)
  }
  getUserById(id:number){
    return this.http.get(environment.API_URL+this.auth+this.userUrl+`/${id}`)
  }
}
