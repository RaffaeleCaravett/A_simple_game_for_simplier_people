import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ModeService {
    public mode: BehaviorSubject<string> = new BehaviorSubject<string>('light');


    updateMode(value: string) {
        switch (value) {
            case ('light'): {
                this.mode.next(value);
                localStorage.setItem('mode', value)
            }
                break;
            case ('dark'): {
                this.mode.next(value);
                localStorage.setItem('mode', value)
            }
                break;
            default: {
                this.mode.next('light');
                localStorage.setItem('mode', 'light')
            }
        }
    }
}