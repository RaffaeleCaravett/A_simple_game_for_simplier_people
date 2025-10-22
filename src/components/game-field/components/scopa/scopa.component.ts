import { NgIf, NgForOf, NgClass, NgStyle } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ToastrService } from 'ngx-toastr';


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
  constructor(private toastr: ToastrService) { }

  ngOnInit(): void {
    this.forms();
  }

  forms() {
    this.modalitaForm = new FormGroup({
      modalita: new FormControl('', Validators.required)
    })
  }

  startComputerGame() {
    this.gameHasStarted = true;
    let interval = setInterval(() => {
      this.count -= 1;
      if (this.count == 0) {
        clearInterval(interval);
      }
    }, 1000);
    for (let i = 1; i <= 4; i++) {
      for (let a = 1; a <= 10; a++) {
        this.allCards.push({ value: a, group: i == 1 ? '🪙' : i == 2 ? '🫖' : i == 3 ? '🪓' : '🗡️' });
      }
    }
    this.giveCards();
    this.giveTableCards();
    this.chooseStarter();
  }
  giveCards() {
    if (this.allCards.length > 0) {
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
      this.calculatePoints();
    }
  }
  calculatePoints() {
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
  calculateComputerMove() {
    setTimeout(() => {
      for (let c of this.computerCards) {
        if (this.checkForScopa(c)) {
          this.cleanComputerHand(c);
          this.cleanTable(this.tableCards, 'computer');
          this.computerScopas += 1;
          if (this.computerCards.length == 0 && this.yourCards.length == 0) {
            this.giveCards();
          }
          this.setLastMove();
          this.tourn = 'user';
          return;
        }
      }
      for (let c of this.computerCards) {
        for (let tc = 0; tc <= this.tableCards.length - 1; tc++) {
          for (let itc = this.tableCards.length - (tc + 1); itc >= 1; itc--) {
            if (c.value == (this.tableCards[tc].value + this.tableCards[itc].value)) {
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
    }, 2000)
  }
  takeCard(cards: any[]) {
    cards.forEach(c => {
      if (this.tourn == 'computer') {
        this.computerCardsTaken.push(c);
      } else {
        this.yourCardsTaken.push(c);
      }
    })
  }
  checkForScopa(card: any): boolean {
    let totalTableValue = 0;
    this.tableCards.forEach(c => {
      totalTableValue += c.value;
    });
    if (card.value == totalTableValue) return true;
    else return false;
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
  }
  selectCard(card: any) {
    if (!this.selectedCard.includes(card)) {
      this.selectedCard.push(card);
    } else {
      this.selectedCard = this.selectedCard.filter(c => c != card);
    }
  }
  chooseCard(card: any) {

    if (this.release) {
      this.tableCards.push(card);
      this.yourCards = this.yourCards.filter(c => c != card);
      this.tourn = 'computer';
      this.release = false;
      if (this.computerCards.length == 0 && this.yourCards.length == 0) {
        this.giveCards();
      }
      this.calculateComputerMove();
      return;
    }
    if (this.selectedCard.length == 0) {
      this.toastr.error("Seleziona prima le carte dal tavolo");
    } else {
      let selectedValue = 0;
      this.selectedCard.forEach(c => selectedValue += c.value);
      if (card.value == selectedValue) {
        this.cleanTable(this.selectedCard, 'user');
        this.cleanYourHand(card);
        if (this.tableCards.length == 0) {
          this.yourScopas += 1;
        }
        this.selectedCard = [];
        this.setLastMove();
        this.tourn = 'computer';
        if (this.computerCards.length == 0 && this.yourCards.length == 0) {
          this.giveCards();
        }
        this.calculateComputerMove();
      }
    }
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
}
