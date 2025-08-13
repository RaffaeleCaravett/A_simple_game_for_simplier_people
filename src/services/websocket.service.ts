import { CompatClient, Stomp, StompSubscription } from "@stomp/stompjs";
import { Message, Messaggio, User, UserConnection } from "../interfaces/interfaces";
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
    private connectionSubscription: StompSubscription | undefined;
    private interval: any = null;
    private intervalStatus: any = null;

    public messageBehaviorSubject: BehaviorSubject<Messaggio | null> = new BehaviorSubject<Messaggio | null>(null);
    public connectionBehaviorSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

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
    public sendStatus(user: UserConnection): void {
        if (this.connection && this.connection.connected) {
            this.connection.send('/chat/status', {}, JSON.stringify(user));
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
    public listenStatus(fun: ListenerCallBack): void {
        if (this.connection) {
            this.connectionSubscription = this.connection.subscribe('/status/receive', (user) => {
                fun(JSON.parse(user.body));
                debugger
                this.connectionBehaviorSubject.next(JSON.parse(user.body) as User)
            });
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.connectionSubscription) {
            this.connectionSubscription.unsubscribe();
        }
    }

}