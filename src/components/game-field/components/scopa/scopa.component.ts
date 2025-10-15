import { NgIf, NgForOf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatTooltipModule } from "@angular/material/tooltip";


@Component({
  selector: 'app-scopa',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, MatTooltipModule, NgForOf],
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
        this.allCards.push({ value: a, group: i == 1 ? 'gold' : i == 2 ? 'cups' : i == 3 ? 'sticks' : 'swords' })
      }
    }
    this.giveCards();
    this.giveTableCards();
  }
  giveCards() {
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
  }
  giveTableCards() {
    for (let i = 1; i <= 4; i++) {
      let card = this.allCards[Math.floor(Math.random() * this.allCards.length)]
      this.tableCards.push(card);
      this.allCards = this.allCards.filter(c => c != card);
    }
  }
}
