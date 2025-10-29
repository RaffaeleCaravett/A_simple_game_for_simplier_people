import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../core/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GamefieldService {

  private partita: string = '/partita';
  private classifiche: string = '/classifiche';
  private trofeo: string = '/trofeo';
  private byUser: string = '/user';
  private byGioco: string = '/gioco';
  private byUserAndDate: string = '/userAndDate';
  private byUserAndGioco: string = '/userAndGioco';
  private assignGiocoToUser: string = '/assignGiocoToUser';
  public points: BehaviorSubject<{ enemy: number, you: number }> = new BehaviorSubject<{ enemy: number, you: number }>({ enemy: 0, you: 0 });
  private enemyPoints: number = 0;
  private userPoints: number = 0;
  private invito: string = '/invito';
  constructor(private http: HttpClient) { }

  postPartite(partita: {}[]) {
    return this.http.post(environment.API_URL + this.partita, partita)
  }

  putPartita(partitaId: number, partita: {}) {
    return this.http.put(environment.API_URL + this.partita + '/' + partitaId, partita)
  }

  getPartitaByUser(userId: number, page: number, size: number, orderBy: string, sortOrder: string, gioco: number) {
    return this.http.get(environment.API_URL + this.partita + this.byUser + `/${userId}?page=${page}&size=${size}&orderBy=${orderBy}&sortOrder=${sortOrder}${gioco != 0 && gioco != null && gioco != undefined ? ('&gioco=' + gioco) : ''}`)
  }
  getClassificheByUser(userId: number, page: number, size: number, orderBy: string, sortOrder: string) {
    return this.http.get(environment.API_URL + this.classifiche + this.byUser + `/${userId}?page=${page}&size=${size}&orderBy=${orderBy}&sortOrder=${sortOrder}`)
  }
  getTrofeiByUser(userId: number, page: number, size: number, orderBy: string, sortOrder: string) {
    return this.http.get(environment.API_URL + this.trofeo + this.byUser + `/${userId}?page=${page}&size=${size}&orderBy=${orderBy}&sortOrder=${sortOrder}`)
  }

  getPartitaByGioco(giocoId: number) {
    return this.http.get(environment.API_URL + this.partita + this.byGioco + `/${giocoId}`)
  }

  getPartitaByUserAndDate(userId: number, from: string, to: string) {
    return this.http.get(environment.API_URL + this.byUserAndDate + `/${userId}?from=${from}&to=${to}`)
  }

  getPartitaByUserAndGioco(userId: number, giocoId: number) {
    return this.http.get(environment.API_URL + this.partita + this.byUserAndGioco + `/${userId}/${giocoId}`)
  }

  assignGiocoUser(giocoId: number, userId: number) {
    return this.http.get(environment.API_URL + this.byGioco + this.assignGiocoToUser + `?gioco=${giocoId}&user=${userId}`)
  }

  getGiochiByUser(userId: number) {
    return this.http.get(environment.API_URL + this.byGioco + this.byUser + `Id`)
  }
  getGiocoById(giocoId: number) {
    return this.http.get(environment.API_URL + this.byGioco + '/' + giocoId)
  }
  getGiochi() {
    return this.http.get(environment.API_URL + this.byGioco + '/idAndName')
  }
  updateScopaPoints(points: { enemy: number, user: number }) {
    this.enemyPoints = points.enemy;
    this.userPoints = points.user;
    this.points.next({ enemy: this.enemyPoints, you: this.userPoints });
  }
  cleanPoints() {
    this.enemyPoints = 0;
    this.userPoints = 0;
  }
  getInvites(game: number, page: number, size: number) {
    return this.http.get(environment.API_URL + this.invito + '/params' + `?page=${page}&size=${size}&gioco=${game}`);
  }
  createInvite(game: number) {
    let invito = {
      giocoId: game
    }
    return this.http.post(environment.API_URL + this.invito, invito);
  }
}
