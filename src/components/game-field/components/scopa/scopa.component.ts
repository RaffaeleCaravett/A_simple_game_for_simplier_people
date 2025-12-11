import { NgIf, NgForOf, NgClass, NgStyle, DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogState } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { ShowScopaPointsComponent } from '../../../../shared/components/show-scopa-points/show-scopa-points.component';
import { GamefieldService } from '../../../../services/gamefield.service';
import { AuthService } from '../../../../services/auth.service';
import {
  GameEnd,
  Invito,
  PartitaDouble,
  ScopaDone,
  ScopaHand,
  SocketDTO,
  User,
} from '../../../../interfaces/interfaces';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { WebsocketService } from '../../../../services/websocket.service';
import { catchError, of } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-scopa',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    MatTooltipModule,
    NgForOf,
    NgClass,
    NgStyle,
    ButtonModule,
    TableModule,
    DatePipe,
    MatProgressSpinnerModule,
  ],
  templateUrl: './scopa.component.html',
  styleUrl: './scopa.component.scss',
})
export class ScopaComponent implements OnInit, OnChanges, OnDestroy {
  @Input() game: number = 0;
  spinner: boolean = false;
  modalitaForm: FormGroup = new FormGroup({});
  count: number = 3;
  gameHasStarted: boolean = false;
  computerCards: any[] = [];
  yourCards: any[] = [];
  allCards: any[] = [];
  tableCards: any[] = [];
  yourCardsTaken: any[] = [];
  computerCardsTaken: any[] = [];
  computerScopas: number = 0;
  yourScopas: number = 0;
  tourn: string = '';
  selectedCard: any[] = [];
  release: boolean = false;
  lastShot: string = '';
  windowWidth: number = 0;
  windowHeight: number = 0;
  showComputerScopa: boolean = false;
  showYourScopa: boolean = false;
  showEnemysScopa: boolean = false;
  pointsChecked: boolean = false;
  enemysCards: any[] = [];
  enemysScopas: number = 0;
  enemysCardsTaken: any[] = [];
  enemysPoints: number = 0;
  round: number = 1;
  computerPoints: number = 0;
  yourPoints: number = 0;
  userWon: boolean = false;
  computerWon: boolean = false;
  enemyWon: boolean = false;
  dialogRef: any = null;
  showOptions: boolean = false;
  user: User | null = null;
  partita: any = null;
  partite: any = null;
  inviti: any = null;
  first = 0;
  rows = 10;
  invitiPage: number = 0;
  invitiSize: number = 10;
  selectedInvite: any = null;
  metaKey: boolean = true;
  tournament: any = null;
  partitaDoubleHasStarted: boolean = false;
  @Input() partitaDouble: PartitaDouble | null = null;
  liveGameCounter: number = 3;
  liveTimerTime: number = 20;
  liveTimer: any;
  liveInterval: any = null;
  automaticChooses: number = 0;
  constructor(
    private toastr: ToastrService,
    private dialog: MatDialog,
    private gameField: GamefieldService,
    private authService: AuthService,
    private ws: WebsocketService,
    private cdr: ChangeDetectorRef
  ) {
    this.gameField.points.subscribe((data: any) => {
      this.partitaDouble
        ? (this.computerPoints = data.enemy)
        : (this.enemysPoints = data.enemy);
      this.yourPoints = data.you;
      if (data.enemy >= 12 && data.enemy > data.you) {
        if (!this.partitaDouble) {
          this.computerWon = true;
          this.gameHasStarted = false;
          this.count = 3;
        } else {
          this.enemyWon = true;
          this.liveGameCounter = 3;
          this.partitaDoubleHasStarted = false;
          if (this.user!.id == this.partitaDouble?.invito?.sender?.id) {
            this.gameField
              .putPartitaDouble(this.partitaDouble.id, {
                gioco: this.partitaDouble.gioco.id,
                invito: this.partitaDouble.invito.id,
                partecipanti: this.partitaDouble.partecipanti.map((c) => c.id),
                torneo: this.partitaDouble?.tournament?.id || null,
                punteggioVincenti: this.enemyWon
                  ? this.enemysPoints
                  : this.yourPoints,
                punteggioPerdenti: this.enemyWon
                  ? this.yourPoints
                  : this.enemysPoints,
                vincitori: this.enemyWon
                  ? this.partitaDouble.partecipanti
                      .map((u) => u.id)
                      .filter(
                        (id) => id != this.partitaDouble?.invito?.sender?.id
                      )
                  : Array.from(this.partitaDouble?.invito?.sender?.id),
              })
              .subscribe({
                next: (data: any) => {
                  this.cleanDatas();
                  this.partitaDouble = data;
                  if (this.user!.id == this.partitaDouble?.invito.sender.id) {
                    let gameEnd: GameEnd = {
                      gameId: this.game,
                      partitaDoubleId: this.partitaDouble!.id,
                      winner:
                        this.user!.id != this.partitaDouble?.invito?.sender?.id
                          ? this.user!.id
                          : this.partitaDouble?.invito?.sender?.id,
                      punteggio:
                        this.partitaDouble?.punteggioVincenti?.punteggio +
                        ' a ' +
                        this.partitaDouble?.punteggioPerdenti,
                    };
                    let socketDTO: SocketDTO = {
                      connectionRequestDTO: null,
                      messageDTO: null,
                      moveDTO: null,
                      gameConnectionDTO: null,
                      connectionDTO: null,
                      invitoDTO: null,
                      scopaHand: null,
                      gameEnd: gameEnd,
                      scopaDone: null,
                    };
                    this.ws.send(socketDTO);
                  }
                },
              });
          }
        }
      } else if (data.you >= 12 && data.you > data.enemy) {
        this.userWon = true;
        if (!this.partitaDouble) {
          this.gameHasStarted = false;
          this.count = 3;
        } else {
          this.liveGameCounter = 3;
          this.partitaDoubleHasStarted = false;
          if (this.user!.id == this.partitaDouble?.invito?.sender?.id) {
            this.gameField
              .putPartitaDouble(this.partitaDouble.id, {
                gioco: this.partitaDouble.gioco.id,
                invito: this.partitaDouble.invito.id,
                partecipanti: this.partitaDouble.partecipanti.map((c) => c.id),
                torneo: this.partitaDouble?.tournament?.id || null,
                punteggioVincenti: this.enemyWon
                  ? this.enemysPoints
                  : this.yourPoints,
                punteggioPerdenti: this.enemyWon
                  ? this.yourPoints
                  : this.enemysPoints,
                vincitori: this.enemyWon
                  ? this.partitaDouble.partecipanti
                      .map((u) => u.id)
                      .filter(
                        (id) => id != this.partitaDouble?.invito?.sender?.id
                      )
                  : Array.from(this.partitaDouble?.invito?.sender?.id),
              })
              .subscribe({
                next: (data: any) => {
                  this.cleanDatas();
                  this.partitaDouble = data;
                  let gameEnd: GameEnd = {
                    gameId: this.game,
                    partitaDoubleId: this.partitaDouble!.id,
                    winner:
                      this.user!.id == this.partitaDouble?.invito?.sender?.id
                        ? this.user!.id
                        : this.partitaDouble?.invito?.sender?.id,
                    punteggio:
                      this.partitaDouble?.punteggioVincenti?.punteggio +
                      ' a ' +
                      this.partitaDouble?.punteggioPerdenti,
                  };
                  let socketDTO: SocketDTO = {
                    connectionRequestDTO: null,
                    messageDTO: null,
                    moveDTO: null,
                    gameConnectionDTO: null,
                    connectionDTO: null,
                    invitoDTO: null,
                    scopaHand: null,
                    gameEnd: gameEnd,
                    scopaDone: null,
                  };
                  this.ws.send(socketDTO);
                },
              });
          }
        }
      }
    });
    this.user = this.authService.getUser();
    this.ws.scopaHandBehaviorSubject.subscribe((data: ScopaHand | null) => {
      if (data && data.partitaId == this.partitaDouble?.id) {
        clearInterval(this.liveTimer);
        clearInterval(this.liveInterval);
        if (data && data.isItStart == true) {
          this.liveGameCounterStarts(data);
        } else if (data && data.isPoint == true) {
          this.openPointsDialog(this.modalitaForm.controls['modalita'].value);
        } else if (data && !data.isItStart && data.isPoint == false) {
          this.setScopaDatas(data);
        }
        if (data.isPoint == false) {
          this.liveTimerTime = 20;
          this.liveTimer = setInterval(() => {
            if (this.liveGameCounter == 0) {
              this.liveTimerTime--;
              if (this.liveTimerTime == 0) {
                if (this.automaticChooses == 3 && this.partitaDouble) {
                  this.spinner = true;
                  this.exitPartitaDouble(
                    'Hai perso la partita per inattività.',
                    1000
                  );
                  clearInterval(this.liveTimer);
                  this.liveTimerTime = 20;
                  return;
                }
                clearInterval(this.liveTimer);
                this.liveTimerTime = 20;
                if (
                  this.tourn == 'enemy' &&
                  this.user!.id != this.partitaDouble?.invito?.sender?.id
                ) {
                  this.automaticChooses += 1;
                  let randomCard = Math.floor(
                    Math.random() * (this.enemysCards.length - 1)
                  );
                  if (randomCard < 0) randomCard = 0;
                  else if (randomCard >= this.enemysCards.length)
                    randomCard = this.enemysCards.length - 1;
                  else randomCard = randomCard;
                  let automaticSelectedCard = this.enemysCards[randomCard];
                  let cardTaken: boolean = false;
                  if (this.checkForScopa(automaticSelectedCard)) {
                    cardTaken = true;
                    for (let c of this.tableCards) {
                      this.enemysCardsTaken.push(c);
                    }
                    this.tableCards = [];
                    this.enemysCardsTaken.push(automaticSelectedCard);
                    this.enemysCards = this.enemysCards.filter(
                      (ec) => ec != automaticSelectedCard
                    );
                    this.createScopa(automaticSelectedCard);
                    return;
                  }
                  for (let c of this.tableCards) {
                    if (c.value == automaticSelectedCard.value) {
                      this.enemysCardsTaken.push(c, automaticSelectedCard);
                      this.enemysCards = this.enemysCards.filter(
                        (ec) => ec != automaticSelectedCard
                      );
                      this.tableCards = this.tableCards.filter((tc) => tc != c);
                      cardTaken = true;
                      this.sendScopaHand();
                    }
                  }
                  if (!cardTaken) {
                    for (let i = 0; i <= this.tableCards.length - 1; i++) {
                      for (let a = this.tableCards.length - 1; a >= 0; a--) {
                        if (
                          this.tableCards[i] != this.tableCards[a] &&
                          Number(this.tableCards[i].value) +
                            Number(this.tableCards[a].value) ==
                            Number(automaticSelectedCard.value)
                        ) {
                          this.enemysCardsTaken.push(this.tableCards[i]);
                          this.enemysCardsTaken.push(this.tableCards[a]);
                          this.enemysCardsTaken.push(automaticSelectedCard);
                          this.enemysCards = this.enemysCards.filter(
                            (ec) => ec != automaticSelectedCard
                          );
                          this.tableCards = this.tableCards.filter(
                            (tc) =>
                              tc != this.tableCards[i] &&
                              tc != this.tableCards[a]
                          );
                          cardTaken = true;
                          this.sendScopaHand();
                          return;
                        }
                      }
                    }
                  }
                  if (!cardTaken && this.tableCards.length > 3) {
                    for (let i = 0; i <= this.tableCards.length - 1; i++) {
                      for (let a = this.tableCards.length - 1; a >= 0; a--) {
                        for (let e = 1; e <= this.tableCards.length - 2; e++) {
                          if (
                            this.tableCards[i] != this.tableCards[a] &&
                            this.tableCards[i] != this.tableCards[e] &&
                            this.tableCards[e] != this.tableCards[a] &&
                            Number(this.tableCards[i].value) +
                              Number(this.tableCards[a].value) +
                              Number(this.tableCards[e].value) ==
                              Number(automaticSelectedCard.value)
                          ) {
                            this.enemysCardsTaken.push(this.tableCards[i]);
                            this.enemysCardsTaken.push(this.tableCards[a]);
                            this.enemysCardsTaken.push(this.tableCards[e]);
                            this.enemysCardsTaken.push(automaticSelectedCard);
                            this.enemysCards = this.enemysCards.filter(
                              (ec) => ec != automaticSelectedCard
                            );
                            this.tableCards = this.tableCards.filter(
                              (tc) =>
                                tc != this.tableCards[i] &&
                                tc != this.tableCards[a] &&
                                tc != this.tableCards[e]
                            );
                            cardTaken = true;
                            this.sendScopaHand();
                            return;
                          }
                        }
                      }
                    }
                  }
                  if (!cardTaken) {
                    this.tableCards.push(automaticSelectedCard);
                    this.enemysCards = this.enemysCards.filter(
                      (card) => card != automaticSelectedCard
                    );
                  }
                  if (
                    this.enemysCards.length == 0 &&
                    this.yourCards.length == 0
                  ) {
                    this.giveCards();
                  }
                  this.sendScopaHand();
                } else if (
                  this.tourn == 'user' &&
                  this.user!.id == this.partitaDouble?.invito?.sender?.id
                ) {
                  this.automaticChooses += 1;
                  let randomCard = Math.floor(
                    Math.random() * (this.yourCards.length - 1)
                  );
                  if (randomCard < 0) randomCard = 0;
                  else if (randomCard >= this.yourCards.length)
                    randomCard = this.yourCards.length - 1;
                  else randomCard = randomCard;
                  let automaticSelectedCard = this.yourCards[randomCard];
                  let cardTaken: boolean = false;
                  if (this.checkForScopa(automaticSelectedCard)) {
                    this.tableCards.forEach((tc) => {
                      this.yourCardsTaken.push(tc);
                    });
                    this.yourCardsTaken.push(automaticSelectedCard);
                    this.yourCards = this.yourCards.filter(
                      (yc) => yc != automaticSelectedCard
                    );
                    this.tableCards = [];
                    cardTaken = true;
                    this.createScopa(automaticSelectedCard);
                    return;
                  } else {
                    for (let c of this.tableCards) {
                      if (c.value == automaticSelectedCard.value) {
                        this.yourCardsTaken.push(c, automaticSelectedCard);
                        this.yourCards = this.yourCards.filter(
                          (ec) => ec != automaticSelectedCard
                        );
                        this.tableCards = this.tableCards.filter(
                          (tc) => tc != c
                        );
                        cardTaken = true;
                        this.sendScopaHand();
                        return;
                      }
                    }
                    if (!cardTaken) {
                      for (let i = 0; i <= this.tableCards.length - 1; i++) {
                        for (let a = this.tableCards.length - 1; a >= 0; a--) {
                          if (
                            this.tableCards[i] != this.tableCards[a] &&
                            Number(
                              this.tableCards[i].value +
                                Number(this.tableCards[a].value)
                            ) == Number(automaticSelectedCard.value)
                          ) {
                            this.yourCardsTaken.push(this.tableCards[i]);
                            this.yourCardsTaken.push(this.tableCards[a]);
                            this.yourCardsTaken.push(automaticSelectedCard);
                            this.yourCards = this.yourCards.filter(
                              (ec) => ec != automaticSelectedCard
                            );
                            this.tableCards = this.tableCards.filter(
                              (tc) =>
                                tc != this.tableCards[i] &&
                                tc != this.tableCards[a]
                            );
                            cardTaken = true;
                            this.sendScopaHand();
                            return;
                          }
                        }
                      }
                    }
                    if (!cardTaken && this.tableCards.length > 3) {
                      for (let i = 0; i <= this.tableCards.length - 1; i++) {
                        for (let a = this.tableCards.length - 1; a >= 0; a--) {
                          for (
                            let e = 1;
                            e <= this.tableCards.length - 2;
                            e++
                          ) {
                            if (
                              this.tableCards[i] != this.tableCards[a] &&
                              this.tableCards[i] != this.tableCards[e] &&
                              this.tableCards[e] != this.tableCards[a] &&
                              Number(this.tableCards[i].value) +
                                Number(this.tableCards[a].value) +
                                Number(this.tableCards[e].value) ==
                                Number(automaticSelectedCard.value)
                            ) {
                              this.yourCardsTaken.push(this.tableCards[i]);
                              this.yourCardsTaken.push(this.tableCards[a]);
                              this.yourCardsTaken.push(this.tableCards[e]);
                              this.yourCardsTaken.push(automaticSelectedCard);
                              this.yourCards = this.yourCards.filter(
                                (ec) => ec != automaticSelectedCard
                              );
                              this.tableCards = this.tableCards.filter(
                                (tc) =>
                                  tc != this.tableCards[i] &&
                                  tc != this.tableCards[a] &&
                                  tc != this.tableCards[e]
                              );
                              cardTaken = true;
                              this.sendScopaHand();
                              return;
                            }
                          }
                        }
                      }
                    }
                    if (!cardTaken) {
                      this.tableCards.push(automaticSelectedCard);
                      this.yourCards = this.yourCards.filter(
                        (card) => card != automaticSelectedCard
                      );
                    }
                    if (
                      this.enemysCards.length == 0 &&
                      this.yourCards.length == 0
                    ) {
                      this.giveCards();
                    }
                    this.sendScopaHand();
                  }
                }
              }
            }
          }, 1000);
        }
        this.cdr.markForCheck();
      }
    });
    this.ws.gameEndBehaviorSubject.subscribe((data: GameEnd | null) => {
      if (
        data &&
        data.gameId == this.game &&
        data.partitaDoubleId == this.partitaDouble?.id
      ) {
        this.toastr.info('Il gioco è terminato!');
        this.gameField.getPDouble(this.partitaDouble?.id).subscribe({
          next: (dataP: any) => {
            if (dataP) {
              this.automaticChooses = 0;
              if (data?.punteggio == '0') {
                dataP.vincitori.map((u: User) => u.id).includes(this.user!.id)
                  ? this.toastr.info("Hai vinto per abbandono dell'avversario!")
                  : '';
              }
              if (
                dataP.invito?.sender?.id == this.user!.id &&
                dataP.vincitori.map((u: User) => u.id).includes(this.user!.id)
              ) {
                this.userWon;
              } else {
                this.enemyWon;
              }
              if (this.liveInterval) {
                clearInterval(this.liveInterval);
              }
            }
          },
          error: (err: any) => {
            this.toastr.show(
              err?.error?.message ||
                "E' successo qualcosa nel recupero dei dati. Ogni informazione è stata comunque salvata e se hai vinto a tavolino, o per merito, o perso per qualsiasi " +
                  'motivo ne teniamo conto comunque.'
            );
          },
          complete: () => {
            this.partitaDouble = null;
            this.liveGameCounter = 3;
            this.liveTimerTime = 20;
            this.partitaDoubleHasStarted = false;
            this.cleanDatas();
            clearInterval(this.liveInterval);
            clearInterval(this.liveTimer);
            this.getInviti();
          },
        });
      }
    });
    this.ws.scopaDoneBehaviorSubject.subscribe((data: ScopaDone | null) => {
      if (data && data?.partitaDoubleId == this.partitaDouble?.id) {
        if (data?.userId == this.user!.id) {
          this.showYourScopa = true;
        }
        if (
          data?.userId != this.user!.id &&
          this.partitaDouble?.partecipanti
            ?.map((p: User) => p.id)
            .includes(this.user!.id)
        ) {
          this.showEnemysScopa = true;
        }
        setTimeout(() => {
          if (this.user!.id == data.userId) {
            let cards: ScopaHand = this.organizeScopaHand();
            cards.tourn = this.setPartitaDoubleTourn();
            // if (data?.userId == this.user!.id) {
            //   for (let c of cards.tableCards) {
            //     cards.yourCardsTaken.push(c);
            //   }
            //   cards.yourCards = cards.yourCards.filter((c) => {
            //     console.log(c, data.scopaCard);
            //     return c != data.scopaCard;
            //   });
            //   if (!this.yourCardsTaken.includes(data.scopaCard)) {
            //     this.yourCardsTaken.push(data.scopaCard);
            //   }
            // } else {
            //   for (let c of cards.tableCards) {
            //     cards.enemysCardsTaken.push(c);
            //   }
            //   cards.enemysCards = cards.enemysCards.filter((c) => {
            //     console.log(c, data.scopaCard);
            //     return c != data.scopaCard;
            //   });
            //   if (!this.enemysCardsTaken.includes(data.scopaCard)) {
            //     this.enemysCardsTaken.push(data.scopaCard);
            //   }
            // }
            cards.tableCards = [];
            let socketDTO: SocketDTO = {
              messageDTO: null,
              connectionDTO: null,
              gameConnectionDTO: null,
              moveDTO: null,
              connectionRequestDTO: null,
              invitoDTO: null,
              scopaHand: cards,
              gameEnd: null,
              scopaDone: null,
            };
            if (
              cards.allCards.length == 0 &&
              cards.yourCards.length == 0 &&
              cards.enemysCards.length == 0
            ) {
              cards.isPoint = true;
            }
            this.ws.send(socketDTO);
          }
          this.showEnemysScopa = false;
          this.showYourScopa = false;
        }, 3000);
      }
    });
  }
  sendScopaHand() {
    let scopaHand: ScopaHand = this.organizeScopaHand();
    scopaHand.tourn = this.setPartitaDoubleTourn();
    if (
      this.enemysCards.length == 0 &&
      this.yourCards.length == 0 &&
      this.allCards.length == 0
    ) {
      scopaHand.isPoint = true;
    }
    let socketDTO: SocketDTO = {
      messageDTO: null,
      connectionDTO: null,
      gameConnectionDTO: null,
      moveDTO: null,
      connectionRequestDTO: null,
      invitoDTO: null,
      scopaHand: scopaHand,
      gameEnd: null,
      scopaDone: null,
    };

    this.ws.send(socketDTO);
  }
  createScopa(card: any) {
    let scopa: ScopaDone = {
      userId: this.user!.id,
      partitaDoubleId: this.partitaDouble!.id,
      scopaCard: card,
    };
    let socketDTO: SocketDTO = {
      messageDTO: null,
      connectionDTO: null,
      gameConnectionDTO: null,
      moveDTO: null,
      connectionRequestDTO: null,
      invitoDTO: null,
      scopaHand: null,
      gameEnd: null,
      scopaDone: scopa,
    };
    this.ws.send(socketDTO);
    return;
  }
  playAgain() {
    this.partitaDouble = null;
    this.liveGameCounter = 3;
    this.partitaDoubleHasStarted = false;
    this.enemyWon = false;
    this.userWon = false;
    this.modalitaForm.controls['liveAction'].setValue('liveHall');
    this.modalitaForm.updateValueAndValidity();
  }
  setScopaDatas(data: ScopaHand, isNew?: boolean) {
    this.enemysCards = data.enemysCards;
    this.enemysCardsTaken = data.enemysCardsTaken;
    this.enemysPoints = data.enemysPoints;
    this.enemysScopas = data.enemysScopas;
    this.yourCards = data.yourCards;
    this.yourCardsTaken = data.yourCardsTaken;
    this.yourPoints = data.yourPoints;
    this.yourScopas = data.yourScopas;
    this.tableCards = data.tableCards;
    this.partitaDoubleHasStarted = true;
    this.tourn = data.tourn;
    this.allCards = data.allCards;
    if (isNew) {
      this.toastr.success('Partita iniziata');
    }
    if (
      this.allCards.length == 0 &&
      this.yourCards.length == 0 &&
      this.enemysCards.length == 0 &&
      this.yourPoints < 12 &&
      this.enemysPoints < 12
    ) {
      let scopaHand: ScopaHand = this.startLiveGame();
      let socketDTO: SocketDTO = {
        messageDTO: null,
        connectionDTO: null,
        gameConnectionDTO: null,
        moveDTO: null,
        connectionRequestDTO: null,
        invitoDTO: null,
        scopaHand: scopaHand,
        gameEnd: null,
        scopaDone: null,
      };
      this.ws.send(socketDTO);
    }
  }
  liveGameCounterStarts(data: ScopaHand) {
    this.liveInterval = setInterval(() => {
      this.liveGameCounter--;
      if (this.liveGameCounter == 0) {
        this.partitaDoubleHasStarted = true;
        this.setScopaDatas(data, true);
        clearInterval(this.liveInterval);
      }
    }, 3000);
  }
  //METODO CHE VIENE USATO PER INTERCETTARE UN INVITO ACCETTATO
  ngOnChanges(changes: SimpleChanges): void {
    let pt = changes['partitaDouble'];
    if (pt != null) {
      if (pt.currentValue?.invito.sender.id == this.user!.id) {
        if (!this.partitaDoubleHasStarted) {
          this.partitaDouble = pt.currentValue;
          let cards: ScopaHand = this.startLiveGame();
          let socketDTO: SocketDTO = {
            messageDTO: null,
            connectionDTO: null,
            gameConnectionDTO: null,
            moveDTO: null,
            connectionRequestDTO: null,
            invitoDTO: null,
            scopaHand: cards,
            gameEnd: null,
            scopaDone: null,
          };
          this.ws.send(socketDTO);
        }
      }
    }
  }
  startLiveGame(data?: any): ScopaHand {
    for (let i = 1; i <= 4; i++) {
      for (let a = 1; a <= 10; a++) {
        this.allCards.push({
          value: a,
          group: i == 1 ? '🪙' : i == 2 ? '🫖' : i == 3 ? '🪓' : '🗡️',
          primeraValue:
            a == 7
              ? 21
              : a == 6
              ? 18
              : a == 1
              ? 16
              : a == 5
              ? 15
              : a == 4
              ? 14
              : a == 3
              ? 13
              : a == 2
              ? 12
              : 10,
        });
      }
    }
    if (!data || !data?.isItStart) {
      this.giveCards();
      this.giveTableCards();
    }
    this.chooseStarter();

    let scopaHand: ScopaHand = this.organizeScopaHand();
    return scopaHand;
  }

  organizeScopaHand(isPoint?: boolean): ScopaHand {
    let scopaHand: ScopaHand = {
      enemysCards: this.enemysCards,
      yourCards: this.yourCards,
      tableCards: this.tableCards,
      enemysCardsTaken: this.enemysCardsTaken,
      yourCardsTaken: this.yourCardsTaken,
      enemysScopas: this.enemysScopas,
      yourScopas: this.yourScopas,
      enemysPoints: this.enemysPoints,
      yourPoints: this.yourPoints,
      allCards: this.allCards,
      isItStart: !this.partitaDoubleHasStarted,
      tourn: this.tourn,
      partitaId: this.partitaDouble?.id || null,
      isPoint: isPoint || false,
    };
    return scopaHand;
  }
  cleanDatas() {
    this.computerCards = [];
    this.enemysCards = [];
    this.yourCards = [];
    this.allCards = [];
    this.tableCards = [];
    this.yourCardsTaken = [];
    this.computerCardsTaken = [];
    this.enemysCardsTaken = [];
    this.computerScopas = 0;
    this.yourScopas = 0;
    this.enemysScopas = 0;
    this.tourn = '';
    this.round = 1;
    this.computerPoints = 0;
    this.yourPoints = 0;
    this.enemysPoints = 0;
  }
  ngOnInit(): void {
    this.forms();
    this.takeMisures();
  }

  forms() {
    this.modalitaForm = new FormGroup({
      modalita: new FormControl('', Validators.required),
      liveAction: new FormControl(''),
    });
    setTimeout(() => {
      if (this.partitaDouble) {
        this.modalitaForm.controls['modalita'].setValue('live');
        this.modalitaForm.updateValueAndValidity();
      }
    }, 1000);
  }
  getPartite() {
    this.gameField
      .getPartitaByUserAndGioco(this.user!.id, this.game)
      .subscribe({
        next: (data: any) => {
          this.partite = data;
        },
      });
  }
  startComputerGame() {
    if (this.round == 1 && !this.partitaDouble) {
      this.getPartite();
      this.gameField
        .postPartite([
          {
            userId: this.user!.id,
            giocoId: this.game,
            esito: 'PERSA',
            punteggio: 0,
          },
        ])
        .subscribe({
          next: (data: any) => {
            this.partita = data[0];
          },
        });
      this.gameHasStarted = true;
      let interval = setInterval(() => {
        this.count -= 1;
        if (this.count == 0) {
          clearInterval(interval);
        }
      }, 1000);
    }
    for (let i = 1; i <= 4; i++) {
      for (let a = 1; a <= 10; a++) {
        this.allCards.push({
          value: a,
          group: i == 1 ? '🪙' : i == 2 ? '🫖' : i == 3 ? '🪓' : '🗡️',
          primeraValue:
            a == 7
              ? 21
              : a == 6
              ? 18
              : a == 1
              ? 16
              : a == 5
              ? 15
              : a == 4
              ? 14
              : a == 3
              ? 13
              : a == 2
              ? 12
              : 10,
        });
      }
    }
    this.giveCards();
    this.giveTableCards();
    this.chooseStarter();
  }
  giveCards() {
    if (
      this.allCards.length > 0 ||
      (this.allCards.length == 0 && this.pointsChecked)
    ) {
      for (let i = 1; i <= 3; i++) {
        let card =
          this.allCards[Math.floor(Math.random() * this.allCards.length)];
        if (!this.partitaDouble) {
          this.computerCards.push(card);
        } else {
          this.enemysCards.push(card);
        }
        this.allCards = this.allCards.filter((c) => c != card);
      }
      for (let i = 1; i <= 3; i++) {
        let card =
          this.allCards[Math.floor(Math.random() * this.allCards.length)];
        this.yourCards.push(card);
        this.allCards = this.allCards.filter((c) => c != card);
      }
    } else {
      if (this.lastShot == 'computer') {
        this.tableCards.forEach((c) => this.computerCardsTaken.push(c));
      } else if (this.lastShot == 'enemy') {
        this.tableCards.forEach((c) => this.enemysCardsTaken.push(c));
      } else {
        this.tableCards.forEach((c) => this.yourCardsTaken.push(c));
      }
      this.tableCards = [];
      this.tourn = '';
      if (this.partitaDouble) {
        let scopaHand: ScopaHand = this.organizeScopaHand(true);
        let socketDTO: SocketDTO = {
          messageDTO: null,
          connectionDTO: null,
          gameConnectionDTO: null,
          moveDTO: null,
          connectionRequestDTO: null,
          invitoDTO: null,
          scopaHand: scopaHand,
          gameEnd: null,
          scopaDone: null,
        };
        this.ws.send(socketDTO);
      } else {
        this.openPointsDialog(this.modalitaForm.controls['modalita'].value);
      }
    }
  }
  calculatePoints() {
    this.tourn = '';
    this.toastr.show('CalculatePoints');
  }
  giveTableCards() {
    for (let i = 1; i <= 4; i++) {
      let card =
        this.allCards[Math.floor(Math.random() * this.allCards.length)];
      this.tableCards.push(card);
      this.allCards = this.allCards.filter((c) => c != card);
    }
  }

  chooseStarter() {
    let number = Math.floor(Math.random() * 2);
    if (number == 1) {
      this.tourn =
        this.modalitaForm.controls['modalita'].value == 'computer'
          ? 'computer'
          : 'enemy';
      setTimeout(() => {
        this.modalitaForm.controls['modalita'].value == 'computer'
          ? this.calculateComputerMove()
          : '';
      }, 4000);
    } else {
      this.tourn = 'user';
    }
  }
  openPointsDialog(mode: string) {
    if (!this.dialogRef) {
      const enemy = this.partitaDouble?.partecipanti.filter(
        (u: User) => u.id != this.partitaDouble?.invito?.sender?.id
      )[0];
      const inviter =
        this.user?.id == this.partitaDouble?.invito?.sender?.id
          ? this.user
          : this.partitaDouble?.partecipanti.filter(
              (u: User) => u.id != this.user!.id
            )[0];
      this.dialogRef = true;
      const dialogRef = this.dialog.open(ShowScopaPointsComponent, {
        data: [
          false,
          mode,
          this.modalitaForm.controls['modalita'].value == 'computer'
            ? this.computerScopas
            : this.enemysScopas,
          this.modalitaForm.controls['modalita'].value == 'computer'
            ? this.computerCardsTaken
            : this.enemysCardsTaken,
          this.modalitaForm.controls['modalita'].value == 'computer'
            ? this.computerPoints
            : this.enemysPoints,
          this.yourScopas,
          this.yourCardsTaken,
          this.yourPoints,
          inviter || null,
          enemy || null,
        ],
        disableClose: this.partitaDouble ? true : false,
      });
      if (this.partitaDouble) {
        //Non c'è bisogno di impostare i punti qui, perchè vengono impostati al subscribe dei punti stessi dopo che vienge chiuso il dialog.
        setTimeout(() => {
          if (dialogRef.getState() === MatDialogState.OPEN) dialogRef.close();
          this.round += 1;
          this.dialogRef = null;
          if (this.user!.id == this.partitaDouble?.invito?.sender?.id) {
            dialogRef.afterClosed().subscribe((data: any) => {
              if (this.computerWon || this.userWon || this.enemyWon) {
                this.toastr.show(
                  this.computerWon || this.enemyWon
                    ? "L'avversario ha vinto!"
                    : 'Hai vinto!'
                );
                this.cleanDatas();
              } else {
                this.enemysCardsTaken = [];
                this.yourCardsTaken = [];
                this.yourScopas = 0;
                this.allCards = [];
                this.yourCards = [];
                this.enemysCards = [];
                this.tableCards = [];
                this.enemysScopas = 0;
                let scopaHand: ScopaHand = this.startLiveGame();
                let socketDTO: SocketDTO = {
                  messageDTO: null,
                  connectionDTO: null,
                  gameConnectionDTO: null,
                  moveDTO: null,
                  connectionRequestDTO: null,
                  invitoDTO: null,
                  scopaHand: scopaHand,
                  gameEnd: null,
                  scopaDone: null,
                };
                this.ws.send(socketDTO);
              }
            });
          }
        }, 15000);
      } else {
        dialogRef.afterClosed().subscribe((data: any) => {
          this.dialogRef = null;
          if (this.computerWon || this.userWon || this.enemyWon) {
            this.toastr.show(
              this.computerWon || this.enemyWon
                ? "L'avversario ha vinto!"
                : 'Hai vinto!'
            );
            if (!this.partitaDouble) {
              this.gameField
                .putPartita(this.partita.id, {
                  userId: this.user!.id,
                  giocoId: this.game,
                  esito: this.computerWon ? 'PERSA' : 'VINTA',
                  punteggio: this.computerWon ? 0 : this.yourPoints,
                })
                .subscribe({
                  next: (data: any) => {
                    this.getPartite();
                  },
                });
            }
            this.cleanDatas();
          } else {
            this.round += 1;
            this.computerCardsTaken = [];
            this.enemysCardsTaken = [];
            this.yourCardsTaken = [];
            this.computerScopas = 0;
            this.yourScopas = 0;
            this.enemysScopas = 0;
            if (!this.partitaDouble) {
              this.startComputerGame();
            } else {
              this.startLiveGame();
            }
          }
        });
      }
    }
  }
  getTournUserName(): string {
    let partecipanti: User[] = this.partitaDouble!.partecipanti;
    let tourn = this.tourn;
    if (tourn == 'enemy') {
      return (
        partecipanti.filter((u: User) => {
          return u.id != this.partitaDouble?.invito?.sender?.id;
        })[0]?.fullName || ''
      );
    } else {
      return this.partitaDouble?.invito?.sender?.fullName || '';
    }
  }
  setRelease() {
    if (this.partitaDouble) {
      if (
        (this.tourn == 'user' &&
          this.user!.id == this.partitaDouble.invito.sender.id) ||
        (this.tourn == 'enemy' &&
          this.user!.id != this.partitaDouble.invito.sender.id)
      ) {
        if (!this.showYourScopa && !this.showEnemysScopa) {
          this.release = !this.release;
          this.selectedCard = [];
        } else {
          this.toastr.error('Aspetta il tuo turno.');
        }
      } else {
        this.toastr.error('Aspetta il tuo turno.');
      }
    } else {
      this.release = !this.release;
      this.selectedCard = [];
    }
  }
  calculateComputerMove() {
    setTimeout(() => {
      for (let c of this.computerCards) {
        if (this.checkForScopa(c)) {
          this.cleanComputerHand(c);
          this.cleanTable(this.tableCards, 'computer');
          this.computerScopas += 1;
          this.showComputerScopa = true;
          setTimeout(() => {
            this.showComputerScopa = false;
            if (this.computerCards.length == 0 && this.yourCards.length == 0) {
              this.giveCards();
            }
            this.setLastMove();
            this.tourn = 'user';
            return;
          }, 3000);
        }
      }
      if (!this.showComputerScopa) {
        for (let c of this.computerCards) {
          for (let tc = 0; tc <= this.tableCards.length - 1; tc++) {
            if (c.value == this.tableCards[tc].value) {
              this.cleanComputerHand(c);
              this.cleanTable([this.tableCards[tc]], 'computer');
              if (
                this.computerCards.length == 0 &&
                this.yourCards.length == 0
              ) {
                this.giveCards();
              }
              this.setLastMove();
              this.tourn = 'user';
              return;
            }
          }
        }
        for (let c of this.computerCards) {
          for (let tc = 0; tc <= this.tableCards.length - 1; tc++) {
            for (let itc = this.tableCards.length - (tc + 1); itc >= 1; itc--) {
              if (
                c.value ==
                  this.tableCards[tc].value + this.tableCards[itc].value &&
                this.tableCards[tc] != this.tableCards[itc]
              ) {
                this.cleanComputerHand(c);
                this.cleanTable(
                  [this.tableCards[tc], this.tableCards[itc]],
                  'computer'
                );
                if (
                  this.computerCards.length == 0 &&
                  this.yourCards.length == 0
                ) {
                  this.giveCards();
                }
                this.setLastMove();
                this.tourn = 'user';
                return;
              }
            }
          }
        }
        let randomIndex = Math.floor(
          Math.random() * (this.computerCards.length - 1)
        );
        this.tableCards.push(this.computerCards[randomIndex]);
        this.computerCards = this.computerCards.filter(
          (c) => c != this.computerCards[randomIndex]
        );
        if (this.computerCards.length == 0 && this.yourCards.length == 0) {
          this.giveCards();
        }
        this.tourn = 'user';
      }
    }, 2000);
  }
  takeCard(cards: any[]) {
    cards.forEach((c) => {
      if (!this.partitaDouble) {
        if (this.tourn == 'computer') {
          this.computerCardsTaken.push(c);
        } else {
          this.yourCardsTaken.push(c);
        }
      } else {
        if (
          this.tourn == 'enemy' &&
          this.user!.id != this.partitaDouble?.invito?.sender?.id
        ) {
          this.enemysCardsTaken.push(c);
        } else {
          this.yourCardsTaken.push(c);
        }
      }
    });
  }
  checkForScopa(card: any): boolean {
    let totalTableValue = 0;
    this.tableCards.forEach((c) => {
      totalTableValue += c.value;
    });
    if (card.value == totalTableValue) {
      return true;
    } else {
      return false;
    }
  }

  cleanComputerHand(card: any) {
    this.computerCards = this.computerCards.filter((c) => c != card);
    this.computerCardsTaken.push(card);
  }
  cleanTable(cards: any[], who: string) {
    for (let c of cards) {
      this.tableCards = this.tableCards.filter((card) => card != c);
      if (who == 'computer') {
        this.computerCardsTaken.push(c);
      } else if (who == 'enemy') {
        this.enemysCardsTaken.push(c);
      } else {
        this.yourCardsTaken.push(c);
      }
    }
  }
  show(cards: any[]) {
    let string: string = '';
    for (let c of cards) {
      string +=
        c.value +
        ' - ' +
        c.group +
        (cards.length == cards.indexOf(c) ? '' : '-') +
        '\n';
    }
    return string;
  }
  selectCard(card: any) {
    if (!this.partitaDouble) {
      if (this.tourn == 'user') {
        if (!this.selectedCard.includes(card)) {
          this.selectedCard.push(card);
        } else {
          this.selectedCard = this.selectedCard.filter((c) => c != card);
        }
      }
    } else {
      if (
        this.tourn == 'user' &&
        this.user!.id == this.partitaDouble?.invito?.sender?.id
      ) {
        if (!this.selectedCard.includes(card)) {
          this.selectedCard.push(card);
        } else {
          this.selectedCard = this.selectedCard.filter((c) => c != card);
        }
      } else if (
        this.tourn == 'enemy' &&
        this.user!.id != this.partitaDouble?.invito?.sender?.id
      ) {
        if (!this.selectedCard.includes(card)) {
          this.selectedCard.push(card);
        } else {
          this.selectedCard = this.selectedCard.filter((c) => c != card);
        }
      }
    }
  }
  chooseCard(card: any) {
    let scopaDone: boolean = false;
    if (
      (this.release && !this.partitaDouble) ||
      (this.release &&
        this.partitaDouble &&
        ((this.tourn == 'user' &&
          this.partitaDouble.invito.sender?.id == this.user!.id) ||
          (this.tourn == 'enemy' &&
            this.partitaDouble.invito.sender?.id != this.user!.id)))
    ) {
      if (!this.checkForPoints()) {
        this.tableCards.push(card);
        if (!this.partitaDouble) {
          this.yourCards = this.yourCards.filter((c) => c != card);
          this.tourn = 'computer';
        } else {
          if (this.tourn == 'user') {
            this.yourCards = this.yourCards.filter((c) => c != card);
          } else {
            this.enemysCards = this.enemysCards.filter((c) => c != card);
          }
        }
        this.release = false;
        if (
          (this.computerCards.length == 0 &&
            this.yourCards.length == 0 &&
            !this.partitaDouble) ||
          (this.enemysCards.length == 0 &&
            this.yourCards.length == 0 &&
            this.partitaDouble)
        ) {
          this.giveCards();
        }
        if (!this.partitaDouble) {
          this.calculateComputerMove();
        }
        if (this.partitaDouble) {
          let scopaHand: ScopaHand = this.organizeScopaHand();
          scopaHand.tourn = this.setPartitaDoubleTourn();
          let socketDTO: SocketDTO = {
            messageDTO: null,
            connectionDTO: null,
            gameConnectionDTO: null,
            moveDTO: null,
            connectionRequestDTO: null,
            invitoDTO: null,
            scopaHand: scopaHand,
            gameEnd: null,
            scopaDone: null,
          };
          this.ws.send(socketDTO);
        }
        return;
      } else {
        if (
          !this.partitaDouble ||
          (this.user!.id == this.partitaDouble.invito.sender.id &&
            this.tourn == 'user') ||
          (this.user!.id != this.partitaDouble.invito.sender.id &&
            this.tourn == 'enemy')
        ) {
          this.toastr.show('Controlla bene! Hai delle carte da prendere.');
        }
      }
    }
    if (
      (this.selectedCard.length == 0 && !this.partitaDouble) ||
      (this.selectedCard.length == 0 &&
        this.partitaDouble &&
        this.tourn == 'enemy' &&
        this.user!.id != this.partitaDouble?.invito?.sender?.id) ||
      (this.selectedCard.length == 0 &&
        this.partitaDouble &&
        this.tourn == 'user' &&
        this.user!.id == this.partitaDouble?.invito?.sender?.id)
    ) {
      this.toastr.error('Seleziona prima la mossa dal tavolo');
    } else {
      if (
        !this.partitaDouble ||
        (this.partitaDouble &&
          ((this.tourn == 'user' &&
            this.user!.id == this.partitaDouble?.invito?.sender?.id) ||
            (this.tourn == 'enemy' &&
              this.user!.id != this.partitaDouble?.invito?.sender?.id)))
      ) {
        let selectedValue: number = 0;
        this.selectedCard.forEach((c) => (selectedValue += Number(c.value)));
        if (selectedValue.toString().startsWith('0')) {
          selectedValue = Number(selectedValue.toString().replace('0', ''));
        }
        let isDouble: boolean = false;
        if (this.selectedCard.length > 1) {
          isDouble = true;
        }
        if ((isDouble && this.isNotSingleCardToBeTaken(card)) || !isDouble) {
          if (card.value == selectedValue) {
            this.cleanTable(this.selectedCard, this.tourn);
            this.cleanYourHand(card);
            if (this.tableCards.length == 0) {
              if (this.tourn == 'user') {
                this.yourScopas += 1;
                scopaDone = true;
              } else {
                this.enemysScopas += 1;
                scopaDone = true;
              }
              if (this.partitaDouble) {
                let scopa: ScopaDone = {
                  userId: this.user!.id,
                  partitaDoubleId: this.partitaDouble!.id,
                  scopaCard: card,
                };
                let socketDTO: SocketDTO = {
                  messageDTO: null,
                  connectionDTO: null,
                  gameConnectionDTO: null,
                  moveDTO: null,
                  connectionRequestDTO: null,
                  invitoDTO: null,
                  scopaHand: null,
                  gameEnd: null,
                  scopaDone: scopa,
                };
                this.ws.send(socketDTO);
              }
            }
            setTimeout(
              () => {
                if (this.showYourScopa && !this.partitaDouble) {
                  this.showYourScopa = false;
                }
                this.selectedCard = [];
                this.setLastMove();
                if (!this.partitaDouble) {
                  this.tourn = 'computer';
                  if (
                    this.computerCards.length == 0 &&
                    this.yourCards.length == 0
                  ) {
                    this.giveCards();
                  }
                  if (!this.userWon && !this.computerWon) {
                    this.calculateComputerMove();
                  }
                } else {
                  if (!this.userWon && !this.enemyWon && !scopaDone) {
                    if (
                      this.enemysCards.length == 0 &&
                      this.yourCards.length == 0
                    ) {
                      this.giveCards();
                    }
                    let cards: ScopaHand = this.organizeScopaHand();
                    cards.tourn = this.setPartitaDoubleTourn();
                    let socketDTO: SocketDTO = {
                      messageDTO: null,
                      connectionDTO: null,
                      gameConnectionDTO: null,
                      moveDTO: null,
                      connectionRequestDTO: null,
                      invitoDTO: null,
                      scopaHand: cards,
                      gameEnd: null,
                      scopaDone: null,
                    };
                    this.ws.send(socketDTO);
                  }
                }
              },
              this.showYourScopa || this.showEnemysScopa ? 3000 : 0
            );
          }
        } else {
          if (
            (this.selectedCard.length == 0 && !this.partitaDouble) ||
            (this.selectedCard.length == 0 &&
              this.partitaDouble &&
              this.tourn == 'enemy' &&
              this.user!.id != this.partitaDouble?.invito?.sender?.id) ||
            (this.selectedCard.length == 0 &&
              this.partitaDouble &&
              this.tourn == 'user' &&
              this.user!.id == this.partitaDouble?.invito?.sender?.id)
          ) {
            this.toastr.show('Devi prendere la carta singola');
          }
        }
      } else {
        if (
          this.partitaDouble &&
          ((this.tourn == 'user' &&
            this.user!.id != this.partitaDouble?.invito?.sender?.id) ||
            (this.tourn == 'enemy' &&
              this.user!.id == this.partitaDouble?.invito?.sender?.id))
        ) {
          this.toastr.error('Aspetta il tuo turno!');
        }
      }
    }
  }
  setPartitaDoubleTourn(): string {
    return this.tourn == 'user' ? 'enemy' : 'user';
  }
  isNotSingleCardToBeTaken(card: any): boolean {
    let isGood: boolean = true;
    this.tableCards.forEach((c: any) => {
      if (c.value == card.value) {
        isGood = false;
      }
    });
    return isGood;
  }
  checkForPoints(): boolean {
    if (!this.partitaDouble) {
      for (let c = 0; c <= this.yourCards.length - 1; c++) {
        if (this.checkForScopa(this.yourCards[c])) {
          return true;
        }
      }
      for (let c = 0; c <= this.yourCards.length - 1; c++) {
        for (let tc = 0; tc <= this.tableCards.length - 1; tc++) {
          if (this.yourCards[c].value == this.tableCards[tc].value) {
            return true;
          }
        }
      }
      for (let c = 0; c <= this.yourCards.length - 1; c++) {
        for (let tc = 0; tc <= this.tableCards.length - 1; tc++) {
          for (let itc = this.tableCards.length - (tc + 1); itc >= 1; itc--) {
            if (
              this.yourCards[c].value ==
                this.tableCards[tc].value + this.tableCards[itc].value &&
              this.tableCards[tc] != this.tableCards[itc]
            ) {
              return true;
            }
          }
        }
      }
      return false;
    } else if (
      this.partitaDouble &&
      this.tourn == 'user' &&
      this.user?.id == this.partitaDouble?.invito.sender?.id
    ) {
      for (let c = 0; c <= this.yourCards.length - 1; c++) {
        if (this.checkForScopa(this.yourCards[c])) {
          return true;
        }
      }
      for (let c = 0; c <= this.yourCards.length - 1; c++) {
        for (let tc = 0; tc <= this.tableCards.length - 1; tc++) {
          if (this.yourCards[c].value == this.tableCards[tc].value) {
            return true;
          }
        }
      }
      for (let c = 0; c <= this.yourCards.length - 1; c++) {
        for (let tc = 0; tc <= this.tableCards.length - 1; tc++) {
          for (let itc = this.tableCards.length - (tc + 1); itc >= 1; itc--) {
            if (
              this.yourCards[c].value ==
                this.tableCards[tc].value + this.tableCards[itc].value &&
              this.tableCards[tc] != this.tableCards[itc]
            ) {
              return true;
            }
          }
        }
      }
      return false;
    } else {
      for (let c = 0; c <= this.enemysCards.length - 1; c++) {
        if (this.checkForScopa(this.enemysCards[c])) {
          return true;
        }
      }
      for (let c = 0; c <= this.enemysCards.length - 1; c++) {
        for (let tc = 0; tc <= this.tableCards.length - 1; tc++) {
          if (this.enemysCards[c].value == this.tableCards[tc].value) {
            return true;
          }
        }
      }
      for (let c = 0; c <= this.enemysCards.length - 1; c++) {
        for (let tc = 0; tc <= this.tableCards.length - 1; tc++) {
          for (let itc = this.tableCards.length - (tc + 1); itc >= 1; itc--) {
            if (
              this.enemysCards[c].value ==
                this.tableCards[tc].value + this.tableCards[itc].value &&
              this.tableCards[tc] != this.tableCards[itc]
            ) {
              return true;
            }
          }
        }
      }
      return false;
    }
  }
  cleanYourHand(card: any) {
    if (this.tourn == 'user') {
      this.yourCards = this.yourCards.filter((c) => c != card);
      this.yourCardsTaken.push(card);
    } else {
      this.enemysCards = this.enemysCards.filter((c) => c != card);
      this.enemysCardsTaken.push(card);
    }
  }
  setLastMove() {
    if (this.allCards.length == 0) {
      this.lastShot = this.tourn;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.takeMisures();
  }
  takeMisures() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
  }
  manageLiveAction() {
    let value = this.modalitaForm.controls['liveAction'];
    if (value.value == 'liveHall') {
      this.getInviti();
    } else {
      this.inviti = [];
    }
  }

  getInviti() {
    this.gameField
      .getInvites(this.game, this.invitiPage, this.invitiSize)
      .subscribe({
        next: (data: any) => {
          this.inviti = data;
        },
      });
  }
  createInvite() {
    this.gameField.createInvite(this.game).subscribe({
      next: (data: any) => {
        this.toastr.success('Invito creato! Resta in attesa!');
      },
    });
  }

  manageInvite(action: string, invito: Invito) {
    if (action == 'Accetta') {
      let socketDTO: SocketDTO = {
        messageDTO: null,
        connectionDTO: null,
        gameConnectionDTO: null,
        moveDTO: null,
        connectionRequestDTO: null,
        invitoDTO: {
          giocoId: this.game,
          status: 'ACCETTATO',
          accepterId: this.user!.id,
          torneo: this.tournament ? this.tournament.id : null,
          senderId: invito?.sender?.id,
          invitoId: invito?.id,
        },
        scopaHand: null,
        gameEnd: null,
        scopaDone: null,
      };
      this.ws.send(socketDTO);
    } else {
      this.gameField.deleteInvito(invito.id).subscribe({
        next: (data: any) => {
          this.toastr.show('Invito eliminato correttamente.');
          this.getInviti();
        },
      });
    }
  }
  exitPartitaDouble(message: string, timer: number) {
    this.gameField
      .putPartitaDouble(this.partitaDouble!.id, {
        gioco: this.partitaDouble!.gioco.id,
        invito: this.partitaDouble!.invito.id,
        partecipanti: this.partitaDouble!.partecipanti.map((c) => c.id),
        torneo: this.partitaDouble?.tournament?.id || null,
        punteggioVincenti: 0,
        punteggioPerdenti: 0,
        vincitori: this.partitaDouble?.partecipanti
          ?.map((c) => c.id)
          .filter((id) => id != this.user!.id),
      })
      .pipe(
        catchError((err) => {
          this.partitaDouble = null;
          this.getInviti();
          return of('I', 'II', 'III', 'IV', 'V');
        })
      )
      .subscribe({
        next: (data: any) => {
          this.spinner = true;
          this.automaticChooses = 0;
          setTimeout(() => {
            this.partitaDouble = null;
            this.cleanDatas();
            this.liveGameCounter = 3;
            this.partitaDoubleHasStarted = false;
            this.spinner = false;
            this.toastr.error(message);
            let gameEnd: GameEnd = {
              gameId: this.game,
              partitaDoubleId: data?.id,
              winner: data?.vincitori[0].id!,
              punteggio: '0',
            };
            let socketDTO: SocketDTO = {
              messageDTO: null,
              connectionDTO: null,
              gameConnectionDTO: null,
              moveDTO: null,
              connectionRequestDTO: null,
              invitoDTO: null,
              scopaHand: null,
              gameEnd: gameEnd,
              scopaDone: null,
            };
            this.ws.send(socketDTO);
            this.getInviti();
          }, timer);
        },
      });
  }
  fullRight() {
    this.invitiPage = this.inviti?.totalPages - 1;
    this.getInviti();
  }
  fullLeft() {
    this.invitiPage = 0;
    this.getInviti();
  }
  next() {
    if (this.inviti?.totalPages > this.invitiPage + 1) {
      this.invitiPage += 1;
      this.getInviti();
    }
  }

  prev() {
    if (this.invitiPage > 0) {
      this.invitiPage -= 1;
      this.getInviti();
    }
  }

  reset() {
    this.invitiPage = 0;
    this.getInviti();
  }

  pageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }

  isLastPage(): boolean {
    return this.inviti ? this.invitiPage == this.inviti.totalPages - 1 : false;
  }

  isFirstPage(): boolean {
    return this.inviti ? this.invitiPage == 0 : false;
  }

  ngOnDestroy(): void {
    if (this.partitaDouble) {
      let vincitori: number[] = [];
      vincitori = this.partitaDouble?.partecipanti
        ?.map((c) => c.id)
        .filter((id) => id != this.user!.id);
      this.gameField
        .putPartitaDouble(this.partitaDouble?.id, {
          gioco: this.partitaDouble.gioco.id,
          invito: this.partitaDouble.invito.id,
          partecipanti: this.partitaDouble.partecipanti.map((c) => c.id),
          torneo: this.partitaDouble?.tournament?.id || null,
          punteggioVincenti: 0,
          punteggioPerdenti: 0,
          vincitori: vincitori,
        })
        .subscribe({
          next: (data: any) => {
            let gameEnd: GameEnd = {
              gameId: this.game,
              partitaDoubleId: data?.id,
              winner: this.partitaDouble?.vincitori
                ? this.partitaDouble.vincitori[0].id
                : 0!,
              punteggio: '0',
            };
            let socketDTO: SocketDTO = {
              messageDTO: null,
              connectionDTO: null,
              gameConnectionDTO: null,
              moveDTO: null,
              connectionRequestDTO: null,
              invitoDTO: null,
              scopaHand: null,
              gameEnd: gameEnd,
              scopaDone: null,
            };
            this.ws.send(socketDTO);
          },
        });
    }
  }
}
