import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../core/environment";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class RecensioneService {
    private recensione: string = '/recensione';
    private userAndGioco: string = '/userAndGioco';
    private byGiocoId: string = '/byGiocoId';
    public alertReces: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(private http: HttpClient) { }

    getRecensioneByUserIdAndGiocoId(giocoId: number) {
        return this.http.get(environment.API_URL + this.recensione + this.userAndGioco + `?giocoId=${giocoId}`);
    }

    getRecensioneByGiocoIdPaginated(giocoId: number, page?: number, size?: number, orderBy?: string, sortOrder?: string) {
        return this.http.get(environment.API_URL + this.recensione + this.byGiocoId + `/${giocoId}?page=${page || ''}&size=${size || ''}&orderBy=${orderBy || ''}&sortOrder=${sortOrder || ''}`);
    }

    saveRecensione(recensione: any) {
        return this.http.post(environment.API_URL + this.recensione, recensione);
    }

    putRecensione(recensione: any, recensioneId: number) {
        return this.http.put(environment.API_URL + this.recensione + `/${recensioneId}`, recensione);
    }

    deleteRecensione(recensioneId: number) {
        return this.http.delete(environment.API_URL + this.recensione + `/${recensioneId}`);
    }
    
    alertRece(value:boolean){
        this.alertReces.next(value);
    }

};