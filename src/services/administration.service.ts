import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../core/environment";

@Injectable({
    providedIn: 'root'
})
export class AdministrationService {
    private categoria: string = '/categoria';

    constructor(private http: HttpClient) { }




    getAllCategories() {
        return this.http.get(environment.API_URL + this.categoria);
    }
    putCategoriaById(id: number, categoria: {}) {
        return this.http.put(environment.API_URL + this.categoria + `/${id}`, categoria);
    }
    assignCatogoriaToAGame(categoriaId: number, giocoId: number) {
        return this.http.get(environment.API_URL + this.categoria) + `/${categoriaId}/${giocoId}`;
    }
    getCategoriaByNameContaining(name: string) {
        return this.http.get(environment.API_URL + this.categoria + `/${name}`);
    }
    saveCategoria(categoria: {}) {
        return this.http.post(environment.API_URL + this.categoria, categoria);
    }
}
