import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../core/environment";

@Injectable({
    providedIn: 'root'
})
export class AdministrationService {
    private gioco: string = '/gioco';
    private byFilters: string = '/byFilter';
    private giochi: string = '';

    constructor(private http: HttpClient) { }



    getAll(body: { nome: string, difficolta: number, punteggio: number }, page: number, size: number, orderBy: string, sortOrder: string, isActive?: boolean) {

        let params: HttpParams = new HttpParams();
        params = params.set('page', page);
        params = params.set('size', size);
        params = params.set('orderBy', orderBy);
        params = params.set('sortOrder', sortOrder);
        if (body.nome) params = params.set('nomeGioco', body.nome);
        if (body.difficolta) params = params.set('difficolta', body.difficolta);
        if (body.punteggio) params = params.set('punteggio', body.punteggio);
        if(isActive) params = params.set('isActive',isActive);
        return this.http.get(environment.API_URL + this.gioco + this.byFilters, { params: params })
    }
}
