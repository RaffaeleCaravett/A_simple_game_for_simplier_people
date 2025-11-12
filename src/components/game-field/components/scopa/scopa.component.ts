import { NgIf, NgForOf, NgClass, NgStyle, DatePipe } from '@angular/common';
import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from "@angular/material/tooltip";
import { ToastrService } from 'ngx-toastr';
import { ShowScopaPointsComponent } from '../../../../shared/components/show-scopa-points/show-scopa-points.component';
import { GamefieldService } from '../../../../services/gamefield.service';
import { AuthService } from '../../../../services/auth.service';
import { Invito, PartitaDouble, ScopaHand, SocketDTO, User } from '../../../../interfaces/interfaces';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { WebsocketService } from '../../../../services/websocket.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-scopa',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, MatTooltipModule, NgForOf, NgClass, NgStyle, ButtonModule, TableModule, DatePipe],
  templateUrl: './scopa.component.html',
  styleUrl: './scopa.component.scss'
})
export class ScopaComponent implements OnInit, OnChanges {
  @Input() game: number = 0;

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
  inviti: any = null
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
  constructor(private toastr: ToastrService, private dialog: MatDialog, private gameField: GamefieldService, private authService: AuthService,
    private ws: WebsocketService, private activatedRoute: ActivatedRoute
  ) {
    this.gameField.points.subscribe((data: any) => {
      this.computerPoints = data.enemy;
      this.yourPoints = data.you;
      if (data.enemy >= 12 && data.enemy > data.you) {
        this.computerWon = true;
        this.gameHasStarted = false;
        this.count = 3;
      } else if (data.you >= 12 && data.you > data.enemy) {
        this.userWon = true;
        this.gameHasStarted = false;
        this.count = 3;
      }
    });
    this.user = this.authService.getUser();
    this.ws.scopaHandBehaviorSubject.subscribe((data: ScopaHand | null) => {
      if (data && data.partitaId == this.partitaDouble?.id) {
        if (data && data.isItStart == true) {
          this.liveGameCounterStarts();
        } else {
          this.setScopaDatas(data);
        }
      }
    });
  }

  setScopaDatas(data: ScopaHand) {
    this.enemysCards = data.enemysCards;
    this.enemysCardsTaken = data.enemysCardsTaken;
    this.enemysPoints = data.enemysPoints;
    this.enemysScopas = data.enemysScopas;
    this.yourCards = data.yourCards;
    this.yourCardsTaken = data.yourCardsTaken;
    this.yourPoints = data.yourPoints;
    this.yourScopas = data.yourScopas;
    this.tableCards = data.tableCards;
    this.partitaDoubleHasStarted = !data.isItStart;
    this.tourn = data.tourn;
  }
  liveGameCounterStarts() {
    const interval = setInterval(() => {
      this.liveGameCounter--;
      if (this.liveGameCounter == 0) {
        this.partitaDoubleHasStarted = true;
        clearInterval(interval);
      }
    }, 3000);
  }
  ngOnChanges(changes: SimpleChanges): void {
    let pt = changes['partitaDouble'];
    if (pt != null) {
      if (pt.currentValue?.invito.sender.id == this.user!.id) {
        if (!this.partitaDoubleHasStarted) {
          let cards: ScopaHand = this.startLiveGame();
          //TODO
          // sending this, the server gives back the stats for everyone (enemyscards, yourcards ecc.) When we have those datas
          // the game starts. So the counter starts, and when the counter finish the user that corresponds to the tourn plays.
          //then send again the stats to the server that gives back again the stats updates and so on .. 
          let socketDTO: SocketDTO = {
            messageDTO: null,
            connectionDTO: null,
            gameConnectionDTO: null,
            moveDTO: null,
            connectionRequestDTO: null,
            invitoDTO: null,
            scopaHand: cards
          }
          this.ws.send(socketDTO);
        }
      }
    }
  }
  startLiveGame(): ScopaHand {
    this.giveCards();
    this.giveTableCards();
    this.chooseStarter();

    let scopaHand: ScopaHand = this.organizeScopaHand();
    return scopaHand;
  }

  organizeScopaHand(): ScopaHand {
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
      isItStart: !this.partitaDoubleHasStarted,
      tourn: this.tourn,
      partitaId: this.partitaDouble?.id || null
    }
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
      liveAction: new FormControl('')
    });
    setTimeout(() => {
      if (this.partitaDouble) {
        this.modalitaForm.controls['modalita'].setValue('live')
        this.modalitaForm.updateValueAndValidity();
      }
    }, 1000);
  }
  getPartite() {
    this.gameField.getPartitaByUserAndGioco(this.user!.id, this.game).subscribe({
      next: (data: any) => {
        this.partite = data;
      }
    })
  }
  startComputerGame() {
    if (this.round == 1 && !this.partitaDouble) {
      this.getPartite();
      this.gameField.postPartite([{
        userId: this.user!.id,
        giocoId: this.game,
        esito: "PERSA",
        punteggio: 0
      }]).subscribe({
        next: (data: any) => {
          this.partita = data[0];
        }
      })
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
          value: a, group: i == 1 ? '🪙' : i == 2 ? '🫖' : i == 3 ? '🪓' : '🗡️', primeraValue: a == 7 ? 21 : a == 6 ? 18 : a == 1 ? 16 : a == 5 ?
            15 : a == 4 ? 14 : a == 3 ? 13 : a == 2 ? 12 : 10
        });
      }
    }
    this.giveCards();
    this.giveTableCards();
    this.chooseStarter();
  }
  giveCards() {
    if (this.allCards.length > 0 || (this.allCards.length == 0 && this.pointsChecked)) {
      for (let i = 1; i <= 3; i++) {
        let card = this.allCards[Math.floor(Math.random() * this.allCards.length)]
        if (!this.partitaDouble) {
          this.computerCards.push(card);
        } else {
          this.enemysCards.push(card);
        }
        this.allCards = this.allCards.filter(c => c != card);
      }
      for (let i = 1; i <= 3; i++) {
        let card = this.allCards[Math.floor(Math.random() * this.allCards.length)]
        this.yourCards.push(card);
        this.allCards = this.allCards.filter(c => c != card);
      }
    } else {
      if (this.lastShot == 'computer') {
        this.tableCards.forEach(c => this.computerCardsTaken.push(c));
      } else if (this.lastShot == 'enemy') {
        this.tableCards.forEach(c => this.enemysCardsTaken.push(c));
      } else {
        this.tableCards.forEach(c => this.yourCardsTaken.push(c));
      }
      this.tableCards = [];
      this.tourn = '';
      this.openPointsDialog(this.modalitaForm.controls['modalita'].value);
    }
  }
  calculatePoints() {
    this.tourn = '';
    this.toastr.show("CalculatePoints");
  }
  giveTableCards() {
    for (let i = 1; i <= 4; i++) {
      let card = this.allCards[Math.floor(Math.random() * this.allCards.length)]
      this.tableCards.push(card);
      this.allCards = this.allCards.filter(c => c != card);
    }
  }

  chooseStarter() {
    let number = Math.floor(Math.random() * 2);
    if (number == 1) {
      this.tourn = this.modalitaForm.controls['modalita'].value == 'computer' ? 'computer' : 'enemy';
      setTimeout(() => {
        this.modalitaForm.controls['modalita'].value == 'computer' ? this.calculateComputerMove() : '';
      }, 4000)
    } else {
      this.tourn = 'user';
    }
  }
  openPointsDialog(mode: string) {
    if (!this.dialogRef) {
      this.dialogRef = true;
      const dialogRef = this.dialog.open(ShowScopaPointsComponent, {
        data: [false,
          mode,
          this.modalitaForm.controls['modalita'].value == 'computer' ?
            this.computerScopas :
            this.enemysScopas,
          this.modalitaForm.controls['modalita'].value == 'computer' ?
            this.computerCardsTaken :
            this.enemysCardsTaken, this.modalitaForm.controls['modalita'].value == 'computer' ?
            this.computerPoints : 0, this.yourScopas, this.yourCardsTaken, this.yourPoints]
      });

      dialogRef.afterClosed().subscribe((data: any) => {
        this.dialogRef = null;
        if (this.computerWon || this.userWon || this.enemyWon) {
          this.toastr.show(this.computerWon || this.enemyWon ? "L'avversario ha vinto!" : "Hai vinto!");
          if (!this.partitaDouble) {
            this.gameField.putPartita(this.partita.id, {
              userId: this.user!.id,
              giocoId: this.game,
              esito: this.computerWon ? "PERSA" : "VINTA",
              punteggio: this.computerWon ? 0 : this.yourPoints
            }).subscribe({
              next: (data: any) => {
                this.getPartite();
              }
            });
          } else {
            this.gameField.putPartitaDouble(this.partitaDouble.id,
              {
                gioco: this.partitaDouble.gioco.id,
                invito: this.partitaDouble.invito.id,
                partecipanti: this.partitaDouble.partecipanti.map(c => c.id),
                torneo: this.partitaDouble?.tournament?.id || null,
                punteggioVincenti: this.enemyWon ? this.enemysPoints : this.yourPoints,
                punteggioPerdenti: this.enemyWon ? this.yourPoints : this.enemysPoints,
                vincitori: this.enemyWon ? this.partitaDouble.partecipanti.map(u => u.id).filter(id => id != this.partitaDouble?.invito?.sender?.id)[0] : this.partitaDouble?.invito?.sender?.id
              }
            ).subscribe({
              next: (data: any) => {
                this.partitaDouble = data;
              }
            });
          }
          this.cleanDatas();
        } else {
          this.round += 1;
          this.computerCardsTaken = [];
          this.enemysCardsTaken = []
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
              if (this.computerCards.length == 0 && this.yourCards.length == 0) {
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
              if (c.value == (this.tableCards[tc].value + this.tableCards[itc].value) && this.tableCards[tc] != this.tableCards[itc]) {
                this.cleanComputerHand(c);
                this.cleanTable([this.tableCards[tc], this.tableCards[itc]], 'computer');
                if (this.computerCards.length == 0 && this.yourCards.length == 0) {
                  this.giveCards();
                }
                this.setLastMove();
                this.tourn = 'user';
                return;
              }
            }
          }
        }
        let randomIndex = Math.floor(Math.random() * (this.computerCards.length - 1));
        this.tableCards.push(this.computerCards[randomIndex]);
        this.computerCards = this.computerCards.filter(c => c != this.computerCards[randomIndex]);
        if (this.computerCards.length == 0 && this.yourCards.length == 0) {
          this.giveCards();
        }
        this.tourn = 'user';
      }
    }, 2000)
  }
  takeCard(cards: any[]) {
    cards.forEach(c => {
      if (!this.partitaDouble) {
        if (this.tourn == 'computer') {
          this.computerCardsTaken.push(c);
        } else {
          this.yourCardsTaken.push(c);
        }
      } else {
        if (this.tourn == 'enemy' && this.user!.id != this.partitaDouble?.invito?.sender?.id) {
          this.enemysCardsTaken.push(c);
        } else {
          this.yourCardsTaken.push(c);
        }
      }
    });
  }
  checkForScopa(card: any): boolean {
    let totalTableValue = 0;
    this.tableCards.forEach(c => {
      totalTableValue += c.value;
    });
    if (card.value == totalTableValue) {
      return true;
    }
    else { return false; }
  }

  cleanComputerHand(card: any) {
    this.computerCards = this.computerCards.filter(c => c != card);
    this.computerCardsTaken.push(card);
  }
  cleanTable(cards: any[], who: string) {
    for (let c of cards) {
      this.tableCards = this.tableCards.filter(card => card != c);
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
      string += c.value + " - " + c.group + (cards.length == cards.indexOf(c) ? '' : '-') + '\n'
    }
    return string;
  }
  selectCard(card: any) {
    if (!this.partitaDouble) {
      if (this.tourn == 'user') {
        if (!this.selectedCard.includes(card)) {
          this.selectedCard.push(card);
        } else {
          this.selectedCard = this.selectedCard.filter(c => c != card);
        }
      }
    } else {
      if (this.tourn == 'user' && this.user!.id == this.partitaDouble?.invito?.sender?.id) {
        if (!this.selectedCard.includes(card)) {
          this.selectedCard.push(card);
        } else {
          this.selectedCard = this.selectedCard.filter(c => c != card);
        }
      } else if (this.tourn == 'enemy' && this.user!.id != this.partitaDouble?.invito?.sender?.id) {
        if (!this.selectedCard.includes(card)) {
          this.selectedCard.push(card);
        } else {
          this.selectedCard = this.selectedCard.filter(c => c != card);
        }
      }
    }
  }
  chooseCard(card: any) {

    if (this.release) {
      if (!this.checkForPoints()) {
        this.tableCards.push(card);
        this.yourCards = this.yourCards.filter(c => c != card);
        if (!this.partitaDouble) {
          this.tourn = 'computer';
        } else {
          this.tourn = this.tourn == 'user' ? 'enemy' : 'user';
        }
        this.release = false;
        if ((this.computerCards.length == 0 && this.yourCards.length == 0 && !this.partitaDouble) || (this.enemysCards.length == 0 && this.yourCards.length == 0 && this.partitaDouble)) {
          this.giveCards();
        }
        if (!this.partitaDouble) {
          this.calculateComputerMove();
        }
        return;
      } else {
        if (!this.partitaDouble || (this.user!.id == this.partitaDouble.invito.sender.id && this.tourn == 'user') ||
          (this.user!.id != this.partitaDouble.invito.sender.id && this.tourn == 'enemy')) {
          this.toastr.show("Controlla bene! Hai delle carte da prendere.");
        }
      }
    }
    if ((this.selectedCard.length == 0 && !this.partitaDouble) || (this.selectedCard.length == 0 && this.partitaDouble && this.tourn == 'enemy' && this.user!.id != this.partitaDouble?.invito?.sender?.id)
      || (this.selectedCard.length == 0 && this.partitaDouble && this.tourn == 'user' && this.user!.id == this.partitaDouble?.invito?.sender?.id)) {
      this.toastr.error("Seleziona prima la mossa dal tavolo");
    } else {
      let selectedValue = 0;
      this.selectedCard.forEach(c => selectedValue += c.value);
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
              this.showYourScopa = true;
            } else {
              this.enemysScopas += 1;
              this.showEnemysScopa = true;
            }
          }
          setTimeout(() => {
            if (this.showYourScopa) {
              this.showYourScopa = false;
            }
            if (this.showEnemysScopa) {
              this.showEnemysScopa = false;
            }
            this.selectedCard = [];
            this.setLastMove();
            if (!this.partitaDouble) {
              this.tourn = 'computer';
              if (this.computerCards.length == 0 && this.yourCards.length == 0) {
                this.giveCards();
              }
              if (!this.userWon && !this.computerWon) {
                this.calculateComputerMove();
              }
            } else {
              if (!this.userWon && !this.enemyWon) {
                let cards: ScopaHand;
                if (this.tourn == 'enemy' && this.user!.id != this.partitaDouble?.invito?.sender?.id) {
                  cards = {
                    enemysCards: this.enemysCards,
                    yourCards: this.yourCards,
                    tableCards: this.tableCards,
                    enemysCardsTaken: this.enemysCardsTaken,
                    yourCardsTaken: this.yourCardsTaken,
                    enemysScopas: this.enemysScopas,
                    yourScopas: this.yourScopas,
                    enemysPoints: this.enemysPoints,
                    yourPoints: this.yourPoints,
                    isItStart: false,
                    tourn: 'user',
                    partitaId: this.partitaDouble.id
                  }
                  let socketDTO: SocketDTO = {
                    messageDTO: null,
                    connectionDTO: null,
                    gameConnectionDTO: null,
                    moveDTO: null,
                    connectionRequestDTO: null,
                    invitoDTO: null,
                    scopaHand: cards
                  }
                  this.ws.send(socketDTO);
                } else if (this.tourn == 'user' && this.user!.id == this.partitaDouble?.invito?.sender?.id) {
                  cards = {
                    enemysCards: this.enemysCards,
                    yourCards: this.yourCards,
                    tableCards: this.tableCards,
                    enemysCardsTaken: this.enemysCardsTaken,
                    yourCardsTaken: this.yourCardsTaken,
                    enemysScopas: this.enemysScopas,
                    yourScopas: this.yourScopas,
                    enemysPoints: this.enemysPoints,
                    yourPoints: this.yourPoints,
                    isItStart: false,
                    tourn: 'enemy',
                    partitaId: this.partitaDouble.id
                  }
                  let socketDTO: SocketDTO = {
                    messageDTO: null,
                    connectionDTO: null,
                    gameConnectionDTO: null,
                    moveDTO: null,
                    connectionRequestDTO: null,
                    invitoDTO: null,
                    scopaHand: cards
                  }
                  this.ws.send(socketDTO);
                }
              }
            }
          }, this.showYourScopa || this.showEnemysScopa ? 3000 : 0);
        }
      } else {
        if ((this.selectedCard.length == 0 && !this.partitaDouble) || (this.selectedCard.length == 0 && this.partitaDouble && this.tourn == 'enemy' && this.user!.id != this.partitaDouble?.invito?.sender?.id)
          || (this.selectedCard.length == 0 && this.partitaDouble && this.tourn == 'user' && this.user!.id == this.partitaDouble?.invito?.sender?.id)) {
          this.toastr.show("Devi prendere la carta singola");
        }
      }

    }
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
          if (this.yourCards[c].value == (this.tableCards[tc].value + this.tableCards[itc].value) && this.tableCards[tc] != this.tableCards[itc]) {
            return true;
          }
        }
      }
    }
    return false;
  }
  cleanYourHand(card: any) {
    if (this.tourn == 'user') {
      this.yourCards = this.yourCards.filter(c => c != card);
      this.yourCardsTaken.push(card);
    } else {
      this.enemysCards = this.enemysCards.filter(c => c != card);
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
    this.gameField.getInvites(this.game, this.invitiPage, this.invitiSize).subscribe({
      next: (data: any) => {
        this.inviti = data;
      }
    });
  }
  createInvite() {
    this.gameField.createInvite(this.game).subscribe({
      next: (data: any) => {
        this.toastr.success("Invito creato! Resta in attesa!");
      }
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
          status: "ACCETTATO",
          accepterId: this.user!.id,
          torneo: this.tournament ? this.tournament.id : null,
          senderId: invito?.sender?.id,
          invitoId: invito?.id
        },
        scopaHand: null
      }
      this.ws.send(socketDTO);
    }
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
}
