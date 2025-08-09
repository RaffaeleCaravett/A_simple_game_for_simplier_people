import { CompatClient, Stomp, StompSubscription } from "@stomp/stompjs";
import { Message, Messaggio } from "../interfaces/interfaces";
import { Injectable, OnDestroy } from "@angular/core";
import { environment } from "../core/environment";
import { BehaviorSubject } from "rxjs";

export type ListenerCallBack = (message: Message) => void;

@Injectable({
    providedIn: 'root'
})
export class WebsocketService implements OnDestroy {

    private connection: CompatClient | undefined = undefined;

    private subscription: StompSubscription | undefined;
    private interval: any = null;

    public messageBehaviorSubject: BehaviorSubject<Messaggio | null> = new BehaviorSubject<Messaggio | null>(null);

    constructor() {
        this.connection = Stomp.client(`${environment.SOCKET_URL}/websocket`);
        this.connection.connect({}, (event: any) => { 
        });
        this.connection.onWebSocketClose = (event: any) => {
            this.interval = setInterval(() => {
                if (!this.connection?.connected) {
                    this.connection = Stomp.client(`${environment.SOCKET_URL}/websocket`);
                    this.connection.connect({}, () => { });
                } else {
                    clearInterval(this.interval);
                    this.interval = null;
                }
            }, 5000);
        }

    }

    public send(message: Message): void {
        if (this.connection && this.connection.connected) {
            this.connection.send('/chat/messages', {}, JSON.stringify(message));
        }
    }

    public listen(fun: ListenerCallBack): void {
        if (this.connection) {
            this.subscription = this.connection.subscribe('/messages/receive', (message) => {
                fun(JSON.parse(message.body));
                this.messageBehaviorSubject.next(JSON.parse(message.body) as Messaggio)
            });
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}