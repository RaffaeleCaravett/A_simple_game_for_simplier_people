import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../core/environment";
import { TorneoDTO } from "../interfaces/interfaces";

@Injectable({
    providedIn: 'root'
})
export class AdministrationService {
    private categoria: string = '/categoria';
    private gioco: string = '/gioco';
    private restore: string = '/restore';
    private torneo: string = '/tournament';

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
        return this.http.put(environment.API_URL + this.categoria + `/${categoria}`, { nome: name });
    }
    deleteCategoria(categoriaId: number) {
        return this.http.delete(environment.API_URL + this.categoria + `/${categoriaId}`)
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
    addCategoria(categoria: {}) {
        return this.http.post(environment.API_URL + this.categoria, categoria);
    }
    getAllTorneiPaged(page?: number, size?: number, order?: string, nome?: string, stato?: string, creazione?: string, inizio?: string, fine?: string, gioco?: string) {

        let params: HttpParams = new HttpParams();
        if (page) {
            params = params.set('page', page);
        }
        if (size) {
            params = params.set('size', size);
        }
        if (order) {
            params = params.set('sort', order);
        }
        if (stato) {
            params = params.set('stato', stato);
        }
        if (nome) {
            params = params.set('nome', nome);
        }
        if (fine) {
            params = params.set('fine', fine);
        }
        if (inizio) {
            params = params.set('inizio', inizio);
        }
        if (creazione) {
            params = params.set('creazione', creazione);
        }
        if (gioco) {
            params = params.set('gioco', gioco);
        }

        return this.http.get(environment.API_URL + this.torneo, { params: params })
    }

    addTorneo(torneo: TorneoDTO) {
        return this.http.post(environment.API_URL + this.torneo, torneo);
    }
    deleteTorneo(torneoId: number) {
        return this.http.delete(environment.API_URL + this.torneo + `/${torneoId}`)
    }
    putTorneo(torneoId: number, nome: string, torneo: any) {
        return this.http.put(environment.API_URL + this.torneo + `/${torneoId}/${nome}`, torneo);
    }
    addGioco(gioco: any, giocoImage: File) {
        let headers = new HttpHeaders();
        let formData: FormData = new FormData();

        formData.append('gioco', new Blob([JSON.stringify(gioco)], {
            type: 'application/json'
        }));
        if (giocoImage && giocoImage != null && giocoImage != undefined) {
            formData.append('gioco_image', giocoImage, giocoImage.name);
        }
        return this.http.post(environment.API_URL + this.gioco, formData, { headers: headers });
    }
}
