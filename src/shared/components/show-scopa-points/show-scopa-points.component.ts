import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { NgForOf, NgIf } from '@angular/common';
import { GamefieldService } from '../../../services/gamefield.service';
import { User } from '../../../interfaces/interfaces';

@Component({
  selector: 'app-show-scopa-points',
  standalone: true,
  imports: [MatDialogTitle, MatDialogActions, MatDialogContent, NgForOf, NgIf],
  templateUrl: './show-scopa-points.component.html',
  styleUrl: './show-scopa-points.component.scss',
})
export class ShowScopaPointsComponent implements OnInit {
  computerPoints: number = 0;
  enemysPoints: number = 0;
  userPoints: number = 0;
  computerCards: any[] = [];
  computerScopas: number = 0;
  enemysCards: any[] = [];
  enemysScopas: number = 0;
  userScopa: number = 0;
  userCards: any[] = [];
  options: boolean = false;
  detailedComputerPoints: { nome: string; punti: number }[] = [];
  detailedEnemysPoints: { nome: string; punti: number }[] = [];
  detailedUserPoints: { nome: string; punti: number }[] = [];
  user: User | null = null;
  enemy: User | null = null;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private gameField: GamefieldService
  ) {}

  ngOnInit(): void {
    this.getData();
  }
  getData() {
    this.options = this.data[0];
    if (this.data[1] == 'computer') {
      this.computerScopas = this.data[2];
      this.computerCards = this.data[3];
      this.computerPoints = this.data[4];
    } else {
      this.enemysScopas = this.data[2];
      this.enemysCards = this.data[3];
      this.enemysPoints = this.data[4];
    }
    this.userScopa = this.data[5];
    this.userCards = this.data[6];
    this.userPoints = this.data[7];
    this.user = this.data[8];
    this.enemy = this.data[10];
    this.calculatePoints();
  }
  filterCards(group: string, cards: any[]) {
    return cards
      .filter((c) => c?.group == group)
      .sort((c: any, a: any) => (c.value < a.value ? -1 : 1));
  }
  calculatePoints() {
    let gold: number = 0;
    let totalUserCard = 0;
    let user7Gold: boolean = false;
    let primeraUser: number = 0;
    let primeraEnemy: number = 0;
    let cupsPoints: number = 0;
    let stickPoints: number = 0;
    let goldPoints: number = 0;
    let swordPoints: number = 0;
    let cpCupsPoints: number = 0;
    let cpStickPoints: number = 0;
    let cpGoldPoints: number = 0;
    let cpSwordPoints: number = 0;

    this.userCards.forEach((c) => {
      if (c.group == '🪙') {
        gold += 1;
      }
      if (c.value == '7' && c.group == '🪙') {
        user7Gold = true;
      }
      totalUserCard += 1;
      if (c.group == '🪙') {
        goldPoints = Math.max(goldPoints, c.primeraValue);
      } else if (c.group == '🫖') {
        cupsPoints = Math.max(cupsPoints, c.primeraValue);
      } else if (c.group == '🪓') {
        stickPoints = Math.max(stickPoints, c.primeraValue);
      } else {
        swordPoints = Math.max(swordPoints, c.primeraValue);
      }
    });
    if (this.data[1] == 'computer') {
      this.computerCards.forEach((c) => {
        if (c.group == '🪙') {
          cpGoldPoints = Math.max(cpGoldPoints, c.primeraValue);
        } else if (c.group == '🫖') {
          cpCupsPoints = Math.max(cpCupsPoints, c.primeraValue);
        } else if (c.group == '🪓') {
          cpStickPoints = Math.max(cpStickPoints, c.primeraValue);
        } else {
          cpSwordPoints = Math.max(cpSwordPoints, c.primeraValue);
        }
      });
    } else {
      this.enemysCards.forEach((c) => {
        if (c.group == '🪙') {
          cpGoldPoints = Math.max(cpGoldPoints, c.primeraValue);
        } else if (c.group == '🫖') {
          cpCupsPoints = Math.max(cpCupsPoints, c.primeraValue);
        } else if (c.group == '🪓') {
          cpStickPoints = Math.max(cpStickPoints, c.primeraValue);
        } else {
          cpSwordPoints = Math.max(cpSwordPoints, c.primeraValue);
        }
      });
    }
    primeraEnemy = cpGoldPoints + cpSwordPoints + cpCupsPoints + cpStickPoints;
    primeraUser = goldPoints + swordPoints + cupsPoints + stickPoints;
    if (primeraEnemy > primeraUser) {
      if (this.data[1] == 'computer') {
        this.detailedComputerPoints.push({ nome: 'primera', punti: 1 });
        this.computerPoints += 1;
      } else {
        this.detailedEnemysPoints.push({ nome: 'primera', punti: 1 });
        this.enemysPoints += 1;
      }
    } else if (primeraEnemy < primeraUser) {
      this.detailedUserPoints.push({ nome: 'primera', punti: 1 });
      this.userPoints += 1;
    }
    if (gold != 5) {
      if (gold > 5) {
        this.detailedUserPoints.push({ nome: 'Carta oro', punti: 1 });
        this.userPoints += 1;
      } else {
        if (this.data[1] == 'computer') {
          this.detailedComputerPoints.push({ nome: 'Carta oro', punti: 1 });
          this.computerPoints += 1;
        } else {
          this.detailedEnemysPoints.push({ nome: 'Carta oro', punti: 1 });
          this.enemysPoints += 1;
        }
      }
    }
    if (totalUserCard > 20) {
      this.detailedUserPoints.push({ nome: 'Carta a lungo', punti: 1 });
      this.userPoints += 1;
    } else if (totalUserCard < 20) {
      if (this.data[1] == 'computer') {
        this.detailedComputerPoints.push({ nome: 'Carta a lungo', punti: 1 });
        this.computerPoints += 1;
      } else {
        this.detailedEnemysPoints.push({ nome: 'Carta a lungo', punti: 1 });
        this.enemysPoints += 1;
      }
    }
    if (user7Gold) {
      this.detailedUserPoints.push({ nome: 'Sette bello', punti: 1 });
      this.userPoints += 1;
    } else {
      if (this.data[1] == 'computer') {
        this.detailedComputerPoints.push({ nome: 'Sette bello', punti: 1 });
        this.computerPoints += 1;
      } else {
        this.detailedEnemysPoints.push({ nome: 'Sette bello', punti: 1 });
        this.enemysPoints += 1;
      }
    }
    if (this.computerScopas != 0) {
      this.detailedComputerPoints.push({
        nome: 'scopa',
        punti: this.computerScopas,
      });
      this.computerPoints += this.computerScopas;
    } else if (this.enemysScopas != 0) {
      this.detailedEnemysPoints.push({
        nome: 'scopa',
        punti: this.enemysScopas,
      });
      this.enemysPoints += this.enemysScopas;
    }
    if (this.userScopa != 0) {
      this.detailedUserPoints.push({ nome: 'scopa', punti: this.userScopa });
      this.userPoints += this.userScopa;
    }
    this.gameField.updateScopaPoints({
      enemy:
        this.data[1] == 'computer' ? this.computerPoints : this.enemysPoints,
      user: this.userPoints,
    });
  }
}
