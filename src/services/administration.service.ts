import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../core/environment";

@Injectable({
    providedIn: 'root'
})
export class AdministrationService {
    private categoria: string = '/categoria';
    private gioco: string = '/gioco';
    private restore: string = '/restore';
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
    modifyCategoria(categoria: number, name: string) {
        return this.http.get(environment.API_URL + this.categoria + `/${categoria}/${name}`);
    }
    putGameById(giocoId: number, gioco?: any, giocoImage?: File | null) {
        let headers = new HttpHeaders();
        let formData: FormData = new FormData();

        formData.append('gioco', new Blob([JSON.stringify(gioco)], {
            type: 'application/json'
        }));
        if (giocoImage && giocoImage != null && giocoImage != undefined) {
            formData.append('gioco_image', giocoImage, giocoImage.name);
        }
        return this.http.put(environment.API_URL + this.gioco + `/${giocoId}`, formData, { headers: headers });
    }
    deleteGame(gameId: number) {
        return this.http.delete(environment.API_URL + this.gioco + `/${gameId}`)
    }
    deleteCategoryFromGameById(giocoId: number, categoriaId: number) {
        return this.http.get(environment.API_URL + this.gioco + this.categoria + `/${giocoId}/${categoriaId}`);
    }
    restoreGame(gameId: number) {
        return this.http.get(environment.API_URL + this.gioco + `${this.restore + '/' + gameId}`);
    }
}
