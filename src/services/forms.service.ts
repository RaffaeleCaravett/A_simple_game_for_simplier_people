import { Injectable } from "@angular/core";
import { LoginUser, SignupUser } from "../interfaces/interfaces";
import { HttpClient } from "@angular/common/http";
import { environment } from "../core/environment";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class FormsService {

    private auth: string = '/auth';
    private login: string = '/login';
    private signup: string = '/signup';
    private cities: string = '/cities';
    private clear: string = '/clear';
    private verifyPasswordCode: string = '/verifyPasswordCode';
    private googleUser: string = '/googleUser';

    public requestLoginCode:BehaviorSubject<String> = new BehaviorSubject<String>('');

    constructor(private http: HttpClient) {
    }

    logIn(body: LoginUser) {
        return this.http.post(environment.API_URL + this.auth + this.login, body);
    }

    signUp(body: SignupUser) {
        let formData = new FormData();
        formData.append(
            'user_signup',
            new Blob([JSON.stringify({
                email:body.email,
                cittaId:body.citta_id,
                password:body.password,
                nome:body.nome,
                cognome:body.cognome
            })], {
                type: 'application/json',
            })
        );
        formData.append('profile_image', body.immagine_profilo);
        return this.http.post(environment.API_URL + this.auth + this.signup, formData);
    }

    getCities(){
        return this.http.get(environment.API_URL+this.auth+this.cities)
    }

    clearCode(email:string){
        return this.http.get(environment.API_URL+this.auth+this.clear+`/${email}`)
    }
    
    verifyCode(email:string, code:string, validation?:boolean){
        return this.http.get(environment.API_URL+this.auth+this.verifyPasswordCode+`/${email}/${code}/${validation||false}`)
    }

    signupGoogleUser(user:any){
        return this.http.post(environment.API_URL + this.auth + this.googleUser, user)
    }
}