import { CompatClient, Stomp, StompSubscription } from "@stomp/stompjs";
import { ConnectionRequestDTO, Message, Messaggio, SocketDTO, User } from "../interfaces/interfaces";
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
    public connectionBehaviorSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
    public connectionRequestBehaviorSubject: BehaviorSubject<ConnectionRequestDTO | null> = new BehaviorSubject<ConnectionRequestDTO | null>(null);

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

    public send(message: SocketDTO): void {
        if (this.connection && this.connection.connected) {
            this.connection.send('/ws/send', {}, JSON.stringify(message));
        }
    }
    public listen(fun: ListenerCallBack): void {
        if (this.connection) {
            this.subscription = this.connection.subscribe('/updates/receive', (message: any) => {
                fun(JSON.parse(message.body));
                let response = JSON.parse(message.body);
                if (response?.immagineProfilo) { //user x connessione
                    this.connectionBehaviorSubject.next(JSON.parse(message.body) as User);
                } else if (response?.settedChatId) { //messaggio x chat
                    this.messageBehaviorSubject.next(JSON.parse(message.body) as Messaggio);
                } else if (response?.inviteState && response?.inviteState == "CONNECTION_REQUEST") { //richiesta di connessione (amicizia)
                    let connectionRequestDTO: ConnectionRequestDTO = {
                        receiverId: JSON.parse(message.body)?.receiverId
                    }
                    this.connectionRequestBehaviorSubject.next(connectionRequestDTO);
                }
            });
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}