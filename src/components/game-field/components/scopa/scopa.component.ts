import { NgIf, NgForOf, NgClass, NgStyle } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from "@angular/material/tooltip";
import { ToastrService } from 'ngx-toastr';
import { ShowScopaPointsComponent } from '../../../../shared/components/show-scopa-points/show-scopa-points.component';
import { GamefieldService } from '../../../../services/gamefield.service';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../interfaces/interfaces';


@Component({
  selector: 'app-scopa',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, MatTooltipModule, NgForOf, NgClass, NgStyle],
  templateUrl: './scopa.component.html',
  styleUrl: './scopa.component.scss'
})
export class ScopaComponent implements OnInit {
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
  pointsChecked: boolean = false;
  enemysScopas: number = 0;
  enemysCardsTaken: any[] = [];
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
  constructor(private toastr: ToastrService, private dialog: MatDialog, private gameField: GamefieldService, private authService: AuthService) {
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
  }
  cleanDatas() {
    this.computerCards = [];
    this.yourCards = [];
    this.allCards = [];
    this.tableCards = [];
    this.yourCardsTaken = [];
    this.computerCardsTaken = [];
    this.computerScopas = 0;
    this.yourScopas = 0;
    this.tourn = '';
    this.round = 1;
    this.computerPoints = 0;
    this.yourPoints = 0;
  }
  ngOnInit(): void {
    this.forms();
    this.takeMisures();
  }

  forms() {
    this.modalitaForm = new FormGroup({
      modalita: new FormControl('', Validators.required)
    })
  }

  startComputerGame() {
    if (this.round == 1) {
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
        this.computerCards.push(card);
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
    if (this.modalitaForm.controls['modalita'].value == 'computer') {
      let number = Math.floor(Math.random() * 2);
      if (number == 1) {
        this.tourn = 'computer';
        setTimeout(() => {
          this.calculateComputerMove();
        }, 4000)
      } else {
        this.tourn = 'user';
      }
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
        if (this.computerWon || this.userWon) {
          this.toastr.show(this.computerWon || this.enemyWon ? "Il computer ha vinto!" : "Hai vinto!");
          console.log(this.user)
          this.gameField.putPartita(this.partita.id, {
            userId: this.user!.id,
            giocoId: this.game,
            esito: this.computerWon ? "PERSA" : "VINTA",
            punteggio: this.computerWon ? 0 : this.yourPoints
          }).subscribe({
            next: (data: any) => {

            }
          });
          this.cleanDatas();
        } else {
          this.round += 1;
          this.computerCardsTaken = [];
          this.yourCardsTaken = [];
          this.computerScopas = 0;
          this.yourScopas = 0;
          this.startComputerGame();
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
      if (this.tourn == 'computer') {
        this.computerCardsTaken.push(c);
      } else {
        this.yourCardsTaken.push(c);
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
      } else {
        this.yourCardsTaken.push(c);
      }
    }
    if (who == 'computer') {
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
    if (this.tourn == 'user') {
      if (!this.selectedCard.includes(card)) {
        this.selectedCard.push(card);
      } else {
        this.selectedCard = this.selectedCard.filter(c => c != card);
      }
    }
  }
  chooseCard(card: any) {

    if (this.release) {
      if (!this.checkForPoints()) {
        this.tableCards.push(card);
        this.yourCards = this.yourCards.filter(c => c != card);
        this.tourn = 'computer';
        this.release = false;
        if (this.computerCards.length == 0 && this.yourCards.length == 0) {
          this.giveCards();
        }
        this.calculateComputerMove();
        return;
      } else {
        this.toastr.show("Controlla bene! Hai delle carte da prendere.");
      }

    }
    if (this.selectedCard.length == 0) {
      this.toastr.error("Seleziona prima la mossa dal tavolo");
    } else {
      let selectedValue = 0;
      this.selectedCard.forEach(c => selectedValue += c.value);
      if (card.value == selectedValue) {
        this.cleanTable(this.selectedCard, 'user');
        this.cleanYourHand(card);
        if (this.tableCards.length == 0) {
          this.yourScopas += 1;
          this.showYourScopa = true;
        }
        setTimeout(() => {
          if (this.showYourScopa) {
            this.showYourScopa = false;
          }
          this.selectedCard = [];
          this.setLastMove();
          this.tourn = 'computer';
          if (this.computerCards.length == 0 && this.yourCards.length == 0) {
            this.giveCards();
          }
          this.calculateComputerMove();
        }, this.showYourScopa ? 3000 : 0);
      }
    }
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
    this.yourCards = this.yourCards.filter(c => c != card);
    this.yourCardsTaken.push(card);
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
}
