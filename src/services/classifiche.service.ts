import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../core/environment";

@Injectable({
    providedIn: 'root'
})
export class ClassificheService {


    private classifiche: string = '/classifiche';
    private user: string = '/user';
    private gioco: string = '/gioco';

    constructor(private http: HttpClient) { }



    getAll(page:number,size:number,orderBy:string,sortOrder:string) {
        return this.http.get(environment.API_URL + this.classifiche+`?page=${page}&size=${size}&orderBy=${orderBy}&sortOrder=${sortOrder}`);
    }

    getByUserId(userId: number) {
        return this.http.get(environment.API_URL + this.classifiche + `/${this.user}/${userId}`);
    }

    getByGiocoId(giocoId: number) {
        return this.http.get(environment.API_URL + this.classifiche + this.gioco + `?giocoId=${giocoId}`);
    }

    getById(id: number) {
        return this.http.get(environment.API_URL + this.classifiche + `/${id}`);
    }
};