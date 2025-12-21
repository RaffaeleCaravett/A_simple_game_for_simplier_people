import { CompatClient, Stomp, StompSubscription } from '@stomp/stompjs';
import {
  ConnectionRequestDTO,
  GameEnd,
  Message,
  Messaggio,
  Notification,
  PartitaDouble,
  ScopaDone,
  ScopaHand,
  SocketDTO,
  User,
} from '../interfaces/interfaces';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { environment } from '../core/environment';
import { BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export type ListenerCallBack = (message: Message) => void;

@Injectable({
  providedIn: 'root',
})
export class WebsocketService implements OnDestroy {
  private connection: CompatClient | undefined = undefined;

  private subscription: StompSubscription | undefined;
  private interval: any = null;
  private toastr = inject(ToastrService);
  public messageBehaviorSubject: BehaviorSubject<Messaggio | null> =
    new BehaviorSubject<Messaggio | null>(null);
  public connectionBehaviorSubject: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);
  public connectionRequestBehaviorSubject: BehaviorSubject<ConnectionRequestDTO | null> =
    new BehaviorSubject<ConnectionRequestDTO | null>(null);
  public notificationBehaviorSubject: BehaviorSubject<Notification | null> =
    new BehaviorSubject<Notification | null>(null);
  public partitaDoubleBehaviorSubject: BehaviorSubject<PartitaDouble | null> =
    new BehaviorSubject<PartitaDouble | null>(null);
  public scopaHandBehaviorSubject: BehaviorSubject<ScopaHand | null> =
    new BehaviorSubject<ScopaHand | null>(null);
  public gameEndBehaviorSubject: BehaviorSubject<GameEnd | null> =
    new BehaviorSubject<GameEnd | null>(null);
  public scopaDoneBehaviorSubject: BehaviorSubject<ScopaDone | null> =
    new BehaviorSubject<ScopaDone | null>(null);

  constructor() {
    this.connection = Stomp.client(`${environment.SOCKET_URL}/websocket`);

    this.connection.connect({}, (event: any) => {});
    this.connection.onWebSocketClose = (event: any) => {
      this.interval = setInterval(() => {
        if (!this.connection?.connected) {
          this.connection = Stomp.client(`${environment.SOCKET_URL}/websocket`);
          this.connection.connect({}, () => {});
        } else {
          clearInterval(this.interval);
          this.interval = null;
        }
      }, 5000);
    };
  }

  public send(message: SocketDTO): void {
    if (this.connection && this.connection.connected) {
      try {
        this.connection.send('/ws/send', {}, JSON.stringify(message));
      } catch (error: any) {
        this.toastr.toastrConfig.disableTimeOut = true;
        this.toastr.toastrConfig.autoDismiss = false;
        this.toastr.show(
          "E' successo un errore imprevisto! Ci scusiamo per il disagio. Ricarica la pagina e se ti va mandaci un reclamo spiegandoci cosa è successo."
        );
      }
    }
  }
  public listen(fun: ListenerCallBack): void {
    if (this.connection) {
      this.subscription = this.connection.subscribe(
        '/updates/receive',
        (message: any) => {
          fun(JSON.parse(message.body));
          let response = JSON.parse(message.body);
          if (response?.immagineProfilo) {
            //user x connessione
            this.connectionBehaviorSubject.next(
              JSON.parse(message.body) as User
            );
          } else if (response?.settedChatId) {
            //messaggio x chat
            this.messageBehaviorSubject.next(
              JSON.parse(message.body) as Messaggio
            );
          } else if (
            response?.inviteState &&
            response?.inviteState == 'CONNECTION_REQUEST'
          ) {
            //richiesta di connessione (amicizia)
            let connectionRequestDTO: ConnectionRequestDTO = {
              receiverId: JSON.parse(message.body)?.receiverId,
            };
            this.connectionRequestBehaviorSubject.next(connectionRequestDTO);
          } else if (
            response?.notificationType &&
            response?.notificationType == 'TOURNAMENT'
          ) {
            let notification: Notification = JSON.parse(message.body);
            this.notificationBehaviorSubject.next(notification);
          } else if (response?.invito && response?.partecipanti?.length == 2) {
            let partitaDouble: PartitaDouble = JSON.parse(message.body);
            this.partitaDoubleBehaviorSubject.next(partitaDouble);
          } else if (response?.partitaId && response?.tableCards) {
            let scopaHand: ScopaHand = JSON.parse(message.body);
            this.scopaHandBehaviorSubject.next(scopaHand);
          } else if (response?.partitaDoubleId && !response.userId) {
            let gameEnd: GameEnd = JSON.parse(message.body);
            this.gameEndBehaviorSubject.next(gameEnd);
          } else if (response?.partitaDoubleId && response.userId) {
            let scopaDone: ScopaDone = JSON.parse(message.body);
            this.scopaDoneBehaviorSubject.next(scopaDone);
          }
        }
      );
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
