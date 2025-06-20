import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../core/environment";
import { from } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class PreferitiServive {
    private preferito: string = '/preferito';
    private user: string = '/user';

    constructor(private http: HttpClient) { }

    getPreferiti(userId: number, page: number, size: number, orderBy: string, sortOrder: string, nomeGioco: string, difficoltaGioco: string) {
        let params: HttpParams = new HttpParams();
        params = params.set('page', page);
        params = params.set('size', size);
        params = params.set('orderBy', orderBy);
        params = params.set('sortOrder', sortOrder);
        if (nomeGioco) params = params.set('giocoName', nomeGioco);
        if (difficoltaGioco) params = params.set('giocoDifficolta', difficoltaGioco);
        return this.http.get(environment.API_URL + this.preferito + this.user + `/ ${userId}`, { params: params });
    }
    deletePreferito(preferitoId: number) {
        return this.http.delete(environment.API_URL + this.preferito + `/ ${preferitoId}`);
    }
}