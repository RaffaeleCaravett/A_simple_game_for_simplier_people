import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ShowErrorService {

     showSpinner: BehaviorSubject<boolean> = new BehaviorSubject<boolean> (false); 

    constructor() { }

    emitShowSpinner(value:boolean){
        this.showSpinner.next(value);
    }
}