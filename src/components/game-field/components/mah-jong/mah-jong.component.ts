import { AfterContentChecked, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { GamefieldService } from '../../../../services/gamefield.service';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../interfaces/interfaces';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mah-jong',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, NgClass, MatTooltipModule],
  templateUrl: './mah-jong.component.html',
  styleUrl: './mah-jong.component.scss',
})
export class MahJongComponent implements OnInit, OnDestroy, AfterContentChecked {
  @Input() game: number = 0;
  user: User | null = null;
  step: number = 1;
  gioco: any = null;
  difficoltaPartitaForm: FormGroup = new FormGroup({});
  difficoltaAvailables: number[] = [1, 2, 3, 4];
  startCount: boolean = false;
  countCount: any;
  countTimer: any;
  firstFloor: string[] = [];
  secondFloor: string[] = [];
  thirdFloor: string[] = [];
  fourthFloor: string[] = [];
  allCards: string[] = [];
  mixedAllCards: string[] = [];
  allTessers: HTMLDivElement[] = [];
  @ViewChild('base', { static: false }) base: any;
  selectedCard: any = null;
  maximumTry: number = 0;
  gameEnd: boolean = false;
  victory: boolean = false;
  initialMaximumTry: number = 0;
  timeLeftMinutes: number = 0;
  timeLeftSeconds: number = 0;
  initialTimeLeft: number = 0;
  punti: number = 0;
  pointsCalculated: boolean = false;
  partiteGiocate: number = 0;
  selectedPartita: number = 0;
  constructor(private gameFieldService: GamefieldService, private authService: AuthService, private changeDetectorRef: ChangeDetectorRef, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.timeLeftSeconds = 0;
    this.getGioco();
    this.initializeForms();
    this.getPartite();
  }
  getPartite() {
    this.gameFieldService.getPartitaByUserAndGioco(this.user!.id, this.game).subscribe({
      next: (partite: any) => {
        this.partiteGiocate = partite?.totalElements;
      }
    })
  }
  initializeForms() {
    this.difficoltaPartitaForm = new FormGroup({
      difficolta: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(3)])
    });
  }
  getGioco() {
    this.gameFieldService.getGiocoById(this.game).subscribe({
      next: (value: any) => {
        this.gioco = value;
      }
    });
  }

  calculatePoints(): number {
    if (this.pointsCalculated) return this.punti;
    else {
      this.pointsCalculated = true
      if (this.maximumTry < 2 && this.maximumTry > 0) {
        this.punti += 1;
      } else if (this.maximumTry > 2) {
        this.punti += Math.floor(this.maximumTry / 2.5);
      }

      if (this.maximumTry < 3) {
        this.punti += 1;
      } else if (this.maximumTry < 5) {
        this.punti += 2;
      } else if (this.maximumTry < 10) {
        this.punti += 4;
      } else if (this.maximumTry < 15) {
        this.punti += 6;
      } else if (this.maximumTry < 20) {
        this.punti += 8;
      } else {
        this.punti += 6;
      }

      this.punti += this.timeLeftMinutes;
      return this.punti;
    }
  }
  toNumber(value: string) {
    return Number(value);
  }
  setDifficolta(value: number) {
    this.difficoltaPartitaForm.controls['difficolta'].setValue(value);
    this.difficoltaPartitaForm.updateValueAndValidity();
  }
  letsPlay() {
    let partite: any[] = [];
    let partita = {
      punteggio: 0,
      userId: this.user!.id,
      giocoId: this.gioco.id,
      esito: "PERSA"
    }
    partite.push(partita);
    this.gameFieldService.postPartite(partite).subscribe({
      next: (value: any) => {
        this.selectedPartita = value.id;
        this.partiteGiocate++;
      }
    });
    this.gameEnd = false;
    this.victory = false;
    this.punti = 0;
    this.pointsCalculated = false;
    this.step = 2;
    this.startCount = true;
    this.firstFloor = [];
    this.secondFloor = [];
    this.thirdFloor = [];
    this.fourthFloor = [];
    this.allCards = [];
    this.allTessers = [];
    this.mixedAllCards = [];
    clearInterval(this.countTimer);
    clearTimeout(this.countCount);
    switch (this.difficoltaPartitaForm.controls['difficolta'].value) {
      case (1): {
        this.initialMaximumTry = 50;
        this.maximumTry = 50;
        this.timeLeftMinutes = 15;
        this.initialTimeLeft = 15;
      }
        break;
      case (2): {
        this.initialMaximumTry = 45;
        this.maximumTry = 45;
        this.timeLeftMinutes = 14;
        this.initialTimeLeft = 14;
      }
        break;
      case (3): {
        this.initialMaximumTry = 40;
        this.maximumTry = 40;
        this.timeLeftMinutes = 13;
        this.initialTimeLeft = 13;
      }
        break;
      case (4): {
        this.initialMaximumTry = 35;
        this.maximumTry = 35;
        this.timeLeftMinutes = 12;
        this.initialTimeLeft = 12;
      }
        break;
      default: {
        this.initialMaximumTry = 50;
        this.maximumTry = 50;
        this.timeLeftMinutes = 15;
        this.initialTimeLeft = 15;
      }
        break;
    }
    this.countCount = setTimeout(() => {
      this.startCount = false;
      this.giveCards();
      this.startTimer();
    }, 4000)
  }
  indietro() {
    clearTimeout(this.countCount);
    clearInterval(this.countTimer);
    this.pointsCalculated = false;
    this.startCount = false;
    this.step = 1;
    this.changeDetectorRef.detectChanges();
  }
  ngOnDestroy(): void {
    clearTimeout(this.countCount);
    clearInterval(this.countTimer);
  }
  startTimer() {
    this.countTimer = setInterval(() => {
      if (this.timeLeftSeconds == 0 && this.timeLeftMinutes > 0) {
        this.timeLeftMinutes--;
        this.timeLeftSeconds = 59;
      } else if (this.timeLeftSeconds != 0 && this.timeLeftMinutes >= 0) {
        this.timeLeftSeconds--;
      } else {
        this.timeLeftMinutes = 0;
        this.timeLeftSeconds = 0;
        this.gameEnd = true;
        this.victory = false;
      }
    }, 1000)
  }
  giveCards() {
    setTimeout(() => {
      for (let i = 0; i <= 1; i++) {
        for (let a = 0; a <= 31; a++) {
          this.firstFloor.push('A' + a);
        }
      }
      for (let a = 0; a <= 1; a++) {
        for (let i = 0; i <= 21; i++) {
          this.secondFloor.push('B' + i);
        }
      }
      for (let a = 0; a <= 1; a++) {
        for (let i = 0; i <= 16; i++) {
          this.thirdFloor.push('C' + i);
        }
      }
      for (let a = 0; a <= 1; a++) {
        for (let i = 0; i <= 4; i++) {
          this.fourthFloor.push('D' + i)
        }
      }
      this.allCards.push(...this.firstFloor);
      this.allCards.push(...this.secondFloor);
      this.allCards.push(...this.thirdFloor);
      this.allCards.push(...this.fourthFloor);


      this.mixAllCards();
    }, 1000);
  }

  mixAllCards() {
    while (this.allCards.length > 0) {
      let randomNumber = Math.floor(Math.random() * this.allCards.length);
      let randomCard = this.allCards[randomNumber];
      this.mixedAllCards.push(randomCard);
      this.allCards = this.allCards.filter((i => v => v !== randomCard || --i)(1));
    }
    this.createWalls();
  }
  ngAfterContentChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  createWalls() {
    let firstWall: any[] = this.mixedAllCards.slice(0, 60);
    let secondWall: any[] = this.mixedAllCards.slice(60, 108);
    let thirdWall: any[] = this.mixedAllCards.slice(108, 144);
    let fourthWall: any[] = this.mixedAllCards.slice(144, 150);
    let fifthWall: any[] = this.mixedAllCards.slice(150, 152);


    let firstFloor: HTMLDivElement[] = [];
    let secondFloor: HTMLDivElement[] = [];
    let thirdFloor: HTMLDivElement[] = [];
    let fourthFloor: HTMLDivElement[] = [];
    let fifthFloor: HTMLDivElement[] = [];

    this.initializeFloors(firstWall, firstFloor, 'first');
    this.initializeFloors(secondWall, secondFloor, 'second');
    this.initializeFloors(thirdWall, thirdFloor, 'third');
    this.initializeFloors(fourthWall, fourthFloor, 'fourth', 4);
    this.initializeFloors(fifthWall, fifthFloor, 'fifth', 6);


    this.distribuiteFloors(firstFloor, this.base?.nativeElement, 5);
    this.distribuiteFloors(secondFloor, this.base?.nativeElement, 4);
    this.distribuiteFloors(thirdFloor, this.base?.nativeElement, 3);
    this.distribuiteFloors(fourthFloor, this.base?.nativeElement, 2);
    this.distribuiteFloors(fifthFloor, this.base?.nativeElement, 1);

  }

  initializeFloors(walls: any[], floor: HTMLDivElement[], floorNumber: string, col?: number) {
    for (let w = 0; w < walls.length; w++) {
      let div = document.createElement('div');
      div.classList.add('p-2');
      div.classList.add('d-flex');
      div.classList.add('align-items-middle');
      div.classList.add('justify-content-center');
      div.classList.add('tessera');
      div.classList.add('personal-box-shadow');
      div.classList.add(col ? `col-${col}` : 'col-1');
      // div.classList.add(floorNumber == 'first' ? 'z-0' : floorNumber == 'second' ? 'z-1' : floorNumber == 'third' ? 'z-2' : floorNumber == 'fourth' ? 'z-3' :
      // floorNumber == 'fifth' ? 'z-4' : 'z-0');
      div.textContent = walls[w];
      div.id = floorNumber + '-' + (w + 1);
      div.addEventListener('click', (event: any) => this.checkMove(div, event));
      floor.push(div);
      this.allTessers.push(div);
    }
  }

  distribuiteFloors(floor: HTMLDivElement[], div: any, zIndex: number) {
    let floorContainer = document.createElement('div');
    floorContainer.classList.add('row');
    floorContainer.classList.add('fs-3');
    floorContainer.classList.add('fw-bold');
    floorContainer.classList.add('position-relative');
    switch (zIndex) {
      case (5): {
        floorContainer.classList.add('w-1000');
      }
        break;
      case (4): {
        floorContainer.classList.add('width-77');
      }
        break;
      case (3): {
        floorContainer.classList.add('width-60');
      }
        break;
      case (2): {
        floorContainer.classList.add('width-35');
      }
        break;
      case (1): {
        floorContainer.classList.add('width-25');
      }
        break;
      default: {
        return;
      }
    }
    floor.forEach(d => {
      floorContainer.append(d);
      div.append(floorContainer)
    });
    if (1 == zIndex) {
      this.colorCards();
    }
  }

  colorCards(isMoreThanFirst?: boolean) {
    let nephewsArray: HTMLDivElement[] = [];
    for (let child of this.base.nativeElement.children) {
      for (let nephew of child.children) {
        if (nephew.textContent != '') nephewsArray.push(nephew);
      }
    }
    for (let i = 0; i <= nephewsArray.length - 1; i++) {
      for (let j = i + 1; j <= nephewsArray.length - 1; j++) {
        if (isMoreThanFirst) this.removeBackgroundColor(nephewsArray[i], nephewsArray[j], isMoreThanFirst);
      }
    }
    for (let i = 0; i <= nephewsArray.length - 1; i++) {
      for (let j = i + 1; j <= nephewsArray.length - 1; j++) {
        if ((nephewsArray[i].textContent == nephewsArray[j].textContent) && nephewsArray[i].textContent != "" && !(this.checkBackgroundPresent(nephewsArray[i]) || this.checkBackgroundPresent(nephewsArray[j]))) {
          this.assignBackgroundColor(nephewsArray[i], nephewsArray[j]);
        }
      }
    }
    let i = 0;
    this.allTessers.forEach(t => {
      if (t.textContent != "") i++;
    })
    if (i == 0) this.youWon();
  }
  checkBackgroundPresent(div: HTMLDivElement): boolean {
    return div.classList.contains('bg-gradient');
  }
  assignBackgroundColor(firstCard: HTMLDivElement, secondCard: HTMLDivElement) {
    let colors: string[] = ['bg-warning', 'bg-danger', 'bg-success'];
    if (this.difficoltaPartitaForm.controls['difficolta'].value == 4) {
      colors.push('bg-info', 'bg-secondary', 'bg-primary');
    } else if (this.difficoltaPartitaForm.controls['difficolta'].value == 3) {
      colors.push('bg-info', 'bg-secondary');
    } else if (this.difficoltaPartitaForm.controls['difficolta'].value == 2) {
      colors.push('bg-info');
    }
    firstCard.classList.add('bg-gradient');
    secondCard.classList.add('bg-gradient');

    let randomColor = Math.floor(Math.random() * (colors.length - 1));
    if (randomColor < 0) randomColor = 0;
    firstCard.classList.add(colors[randomColor]);
    secondCard.classList.add(colors[randomColor]);
  }
  removeBackgroundColor(firstCard: HTMLDivElement, secondCard: HTMLDivElement, isMoreThanFirst?: boolean) {
    let colors: string[] = ['bg-warning', 'bg-danger', 'bg-success'];
    if (this.difficoltaPartitaForm.controls['difficolta'].value == 4) {
      colors.push('bg-info', 'bg-secondary', 'bg-primary');
    } else if (this.difficoltaPartitaForm.controls['difficolta'].value == 3) {
      colors.push('bg-info', 'bg-secondary');
    } else if (this.difficoltaPartitaForm.controls['difficolta'].value == 2) {
      colors.push('bg-info');
    }
    firstCard.classList.remove('bg-gradient');
    secondCard.classList.remove('bg-gradient');

    for (let c of colors) {
      if (!isMoreThanFirst || (isMoreThanFirst && c != "p-2")) {
        firstCard.classList.remove(c);
        secondCard.classList.remove(c);
      }
    }
  }
  isDivClicked: boolean = false;
  checkMove(div: HTMLDivElement, event: any) {
    let selectedDiv: HTMLDivElement = document.createElement('div');
    (document.elementsFromPoint(event.clientX, event.clientY) as HTMLDivElement[])
      .forEach((el: HTMLDivElement) => {
        if (el instanceof HTMLDivElement && el.classList.contains('tessera') && el.textContent != '' && !this.isDivClicked) {
          el.click();
          selectedDiv = el;
          div = el;
          this.isDivClicked = true;
        }
      });
    if (this.isDivClicked) {
      let rows = this.checkRows(div);
      let idNumber = Number(div?.id.substring(div?.id?.lastIndexOf('-') + 1));
      if (div.textContent == '') return;
      if (this.selectedCard && this.selectedCard == div) {
        this.selectedCard = null;
        div.style.transition = '1s';
        div.style.borderColor = '';
        div.style.borderColor = 'black';
        div.style.scale = '1';
        if (div.id == selectedDiv.id) {
          this.isDivClicked = false;
        }
        return;
      }
      let isCardFree: boolean = this.checkIfFree(div, idNumber, rows, event);
      if (isCardFree) {
        if (this.selectedCard && this.selectedCard != div) {
          if ((div.textContent == this.selectedCard.textContent) && this.checkSameBackground(this.selectedCard, div)) {
            div.textContent = '';
            div.style.transition = '1s';
            div.style.display = '';
            div.style.border = 'none';
            div.style.opacity = '0';
            div.style.height = '48px';
            div?.classList.remove('personal-box-shadow');
            document.getElementById(this.selectedCard?.id)!.textContent = '';
            document.getElementById(this.selectedCard?.id)!.style.transition = '1s';
            document.getElementById(this.selectedCard?.id)!.style.display = '';
            document.getElementById(this.selectedCard?.id)!.style.border = 'none';
            document.getElementById(this.selectedCard?.id)!.style.opacity = '0';
            document.getElementById(this.selectedCard?.id)!.style.height = '48px';
            document.getElementById(this.selectedCard?.id)?.classList.remove('personal-box-shadow');
            this.removeBackgroundColor(div, document.getElementById(this.selectedCard?.id) as HTMLDivElement);
            this.selectedCard = null
            if (div.id == selectedDiv.id) {
              this.isDivClicked = false;
            }
            return;
          } else {
            document.getElementById(this.selectedCard?.id)!.style.transition = '1s';
            document.getElementById(this.selectedCard?.id)!.style.scale = '1';
            document.getElementById(this.selectedCard?.id)!.style.borderColor = '';
            document.getElementById(this.selectedCard?.id)!.style.borderColor = 'black';
          }
        }

        div.style.transition = '1s';
        div.style.borderColor = '';
        div.style.borderColor = 'green';
        div.style.scale = '1.1';
        this.selectedCard = div;
      }
      if (div.id == selectedDiv.id) {
        this.isDivClicked = false;
      }
    }
  }
  checkSameBackground(selectedCard: HTMLDivElement, div: HTMLDivElement): boolean {
    let sCC: string[] = selectedCard.classList as unknown as string[];
    let dC: string[] = div.classList as unknown as string[];

    for (let c of sCC) {
      for (let dc of dC) {
        if (c == dc && c != 'bg-gradient' && c.startsWith('bg')) {
          return true;
        }
      }
    }
    return false;
  }

  checkRows(div: HTMLDivElement): number {
    if (div?.id.startsWith('first')) return 5;
    else if (div?.id.startsWith('second')) return 4;
    else if (div?.id.startsWith('third')) return 3;
    else if (div?.id.startsWith('fourth')) return 2;
    else if (div?.id.startsWith('fifth')) return 1;
    else return 0;
  }

  checkIfFree(div: HTMLDivElement, idNumber: number, rows: number, event: any): boolean {

    let currentDiv = document.getElementById(div.id);
    let base = document.getElementById("base");
    let childrenBase: HTMLCollectionOf<HTMLDivElement> = base?.children as HTMLCollectionOf<HTMLDivElement>;
    let nephews: any[] = [];
    for (let i = 0; i <= childrenBase.length - 1; i++) {
      for (let a = 0; a <= childrenBase[i].children.length - 1; a++) {
        nephews.push(childrenBase[i].children[a])
      }
    }
    let positionInGround = currentDiv?.id.substring(0, currentDiv.id.lastIndexOf("-"));

    let hasDivOnto: boolean = false;
    [...nephews].some((div: HTMLDivElement) => {
      let positiveBottom = undefined;
      let positiveRight = undefined;
      let positiveLeft = undefined;
      let positiveTop = undefined;
      if (div.textContent != '') {
        positiveBottom = div.getBoundingClientRect().bottom > 0 ? div.getBoundingClientRect().bottom : -(div.getBoundingClientRect().bottom);
        positiveRight = div.getBoundingClientRect().right > 0 ? div.getBoundingClientRect().right : -(div.getBoundingClientRect().right);
        positiveLeft = div.getBoundingClientRect().left > 0 ? div.getBoundingClientRect().left : -(div.getBoundingClientRect().left);
        positiveTop = div.getBoundingClientRect().top > 0 ? div.getBoundingClientRect().top : -(div.getBoundingClientRect().top);

      }

      let positiveBottomCurrent = currentDiv!.getBoundingClientRect().bottom > 0 ? currentDiv!.getBoundingClientRect().bottom : -(currentDiv!.getBoundingClientRect().bottom);
      let positiveRightCurrent = currentDiv!.getBoundingClientRect().right > 0 ? currentDiv!.getBoundingClientRect().right : -(currentDiv!.getBoundingClientRect().right);
      let positiveLeftCurrent = currentDiv!.getBoundingClientRect().left > 0 ? currentDiv!.getBoundingClientRect().left : -(currentDiv!.getBoundingClientRect().left);
      let positiveTopCurrent = currentDiv!.getBoundingClientRect().top > 0 ? currentDiv!.getBoundingClientRect().top : -(currentDiv!.getBoundingClientRect().top);
      let vertical = 0;
      let horizontal = 0;
      let windowHorizontalCenter = window.innerWidth / 2;
      let windowVerticalCenter = window.innerHeight / 2;

      if (div.textContent != "") {
        if (positionInGround == "first" && div.id.includes("second")) {
          if (positiveBottom && positiveBottom < positiveTopCurrent) {
          } else if (positiveTop && positiveTop > positiveBottomCurrent) {
          } else {
            if (positiveBottom != undefined && (positiveBottom - positiveBottomCurrent) < 48) vertical++;
          }
          if (positiveRight && positiveRight < (positiveLeftCurrent < windowHorizontalCenter ? positiveLeftCurrent - 1.9 : positiveLeftCurrent)) {
          } else if (positiveLeft && positiveLeft > (positiveRightCurrent > windowHorizontalCenter ? positiveRightCurrent : positiveRightCurrent - 2)) {
          } else {
            if (positiveRight != undefined && (positiveRight - positiveRightCurrent > (window.innerWidth > 991.20 ? -78 : -57))) {
              horizontal++;
            } else {
              if (positiveRight != undefined && (positiveRight - positiveRightCurrent < (window.innerWidth > 991.20 ? 78 : 57))) horizontal++;
            }
          }
        } else if (positionInGround == "second" && div.id.includes("third")) {
          if (positiveBottom && positiveBottom < positiveTopCurrent) {
          } else if (positiveTop && positiveTop > positiveBottomCurrent) {
          } else {
            if (positiveBottom != undefined && (positiveBottom - positiveBottomCurrent) < 48) vertical++;
          }
          if (positiveRight && positiveRight < (positiveLeftCurrent < windowHorizontalCenter ? positiveLeftCurrent - 2 : positiveLeftCurrent)) {
          } else if (positiveLeft && positiveLeft > (positiveRightCurrent > windowHorizontalCenter ? positiveRightCurrent : positiveRightCurrent - 2)) {
          } else {
            if (positiveRight != undefined && (positiveRight - positiveRightCurrent > (window.innerWidth > 991.20 ? -58.51 : -43))) {
              horizontal++;
            } else {
              if (positiveRight != undefined && (positiveRight - positiveRightCurrent < (window.innerWidth > 991.20 ? 58.51 : 43))) horizontal++;
            }
          }
        } else if (positionInGround == "third" && div.id.includes("fourth")) {
          if (positiveBottom && positiveBottom < positiveTopCurrent) {
          } else if (positiveTop && positiveTop > positiveBottomCurrent) {
          } else {
            if (positiveBottom != undefined && (positiveBottom - positiveBottomCurrent) < 48) vertical++;
          }
          if (positiveRight && positiveRight < (positiveLeftCurrent < windowHorizontalCenter ? positiveLeftCurrent - 1.9 : positiveLeftCurrent)) {
          } else if (positiveLeft && positiveLeft > (positiveRightCurrent > windowHorizontalCenter ? positiveRightCurrent : positiveRightCurrent - 2)) {
          } else {
            if (positiveRight != undefined && (positiveRight - positiveRightCurrent > (window.innerWidth > 991.20 ? -45.6 : -33))) {
              horizontal++;
            } else {
              if (currentDiv?.id == 'third-3' || currentDiv?.id == 'third-15' || currentDiv?.id == 'third-27') {
                if (positiveLeft != undefined && (positiveLeft - positiveLeftCurrent < (window.innerWidth > 991.20 ? 45.6 : 33))) horizontal++;
              } else {
                if (positiveRight != undefined && (positiveRight - positiveRightCurrent < (window.innerWidth > 991.20 ? 45.6 : 33))) horizontal++;
              }
            }
          }
        }
      }
      if (horizontal != 0 && vertical != 0) {
        hasDivOnto = true;
      }
    }
    );

    if (hasDivOnto) {
      return false;
    }
    let optionalDivLeft: HTMLDivElement | null = document.getElementById(div.id.substring(0, div.id.lastIndexOf('-')) + '-' + (idNumber - 1)) as HTMLDivElement;
    let optionalDivRight: HTMLDivElement | null = document.getElementById(div.id.substring(0, div.id.lastIndexOf('-')) + '-' + (idNumber + 1)) as HTMLDivElement;
    let optionalDivUp: HTMLDivElement | null = null;
    let optionalDivDown: HTMLDivElement | null = null;
    if (rows == 5 && (idNumber == 12 || idNumber == 24 || idNumber == 36 || idNumber == 48)) {
      optionalDivRight = null;
    } else if (rows == 5 && (idNumber == 13 || idNumber == 25 || idNumber == 37 || idNumber == 49)) {
      optionalDivLeft = null;
    } else if (rows == 4 && (idNumber == 12 || idNumber == 24 || idNumber == 36)) {
      optionalDivRight = null;
    } else if (rows == 4 && (idNumber == 13 || idNumber == 25 || idNumber == 37)) {
      optionalDivLeft = null;
    } else if (rows == 3 && (idNumber == 12 || idNumber == 24)) {
      optionalDivRight = null;
    } else if (rows == 3 && (idNumber == 13 || idNumber == 25)) {
      optionalDivLeft = null;
    } else if (rows == 2 && (idNumber == 3)) {
      optionalDivRight = null;
    } else if (rows == 2 && (idNumber == 4)) {
      optionalDivLeft = null;
    }
    if (rows == 5 || rows == 4 || rows == 3) {
      optionalDivUp = document.getElementById(div.id.substring(0, div.id.lastIndexOf('-')) + '-' + (idNumber - 12)) as HTMLDivElement;
      optionalDivDown = document.getElementById(div.id.substring(0, div.id.lastIndexOf('-')) + '-' + (idNumber + 12)) as HTMLDivElement;
    } else if (rows == 2) {
      optionalDivUp = document.getElementById(div.id.substring(0, div.id.lastIndexOf('-')) + '-' + (idNumber - 3)) as HTMLDivElement;
      optionalDivDown = document.getElementById(div.id.substring(0, div.id.lastIndexOf('-')) + '-' + (idNumber + 3)) as HTMLDivElement;
      if (document.getElementById('fifth-1')?.textContent != '' && document.getElementById('fifth-2')?.textContent != '') return false;
      else if ((idNumber == 1 || idNumber == 2 || idNumber == 4 || idNumber == 5) && document.getElementById('fifth-1')?.textContent != '') return false;
      else if ((idNumber == 2 || idNumber == 3 || idNumber == 5 || idNumber == 6) && document.getElementById('fifth-2')?.textContent != '') return false;

    }

    let free: number = 0;
    if (null == optionalDivDown || optionalDivDown?.textContent == '') free += 1;
    if (null == optionalDivLeft || optionalDivLeft?.textContent == '') free += 1;
    if (null == optionalDivRight || optionalDivRight?.textContent == '') free += 1;
    if (null == optionalDivUp || optionalDivUp?.textContent == '') free += 1;
    if (free >= 2) return true;
    return false;
  }


  translateRow(rows: number): string {
    if (rows == 5) {
      return 'first-';
    } else if (rows == 4) {
      return 'second-';
    } else if (rows == 3) {
      return 'third-';
    } else if (rows == 2) {
      return 'fourth-';
    } else {
      return 'fifth-'
    }
  }
  checkIfDivIsPresent(div: any) {
    return (undefined != div && null != div);
  }
  mescolaCarte() {
    if (this.maximumTry > 0) {
      this.maximumTry--;
      // const onlyTextContentAllTessers: HTMLDivElement[] = [...this.allTessers];

      // let currentIndex = this.allTessers.length;
      // while (currentIndex != 0) {

      //   let randomIndex = Math.floor(Math.random() * currentIndex);
      //   currentIndex--;
      //   if (this.allTessers[currentIndex].textContent != "" && this.allTessers[randomIndex].textContent != "") {
      //     let arr: string = [...this.allTessers[currentIndex].textContent as string].toString().replaceAll(',', '');
      //     this.allTessers[currentIndex].textContent = [...this.allTessers[randomIndex].textContent as string].toString().replaceAll(',', '');
      //     this.allTessers[randomIndex].textContent = arr;
      //   }
      // }
      for (let i = this.allTessers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        if (this.allTessers[i].textContent != "" && this.allTessers[j].textContent != "") {
          [this.allTessers[i].textContent, this.allTessers[j].textContent] = [this.allTessers[j].textContent, this.allTessers[i].textContent];
        }
      }
      // for (let t of this.allTessers.filter(t => t.textContent != "")) {
      //   let randomIndex = Math.floor(Math.random() * this.allTessers.filter(t => t.textContent != "").length);
      //   if (randomIndex < 0) randomIndex = 0;
      //   else if (randomIndex == this.allTessers.filter(t => t.textContent != "").length && this.allTessers.filter(t => t.textContent != "").length > 1) randomIndex = this.allTessers.filter(t => t.textContent != "").length - 1;
      //   t.textContent = this.allTessers.filter(t => t.textContent != "")[randomIndex].textContent;
      // }
      this.colorCards(true);
    } else {
      this.toastr.error("Hai esaurito il numero massimo di tentativi per mischiare le tessere.");
    }
    if (this.maximumTry == 10) {
      this.toastr.warning("Ti rimangono 10 tentativi disponibili per mischiare le tessere.");
    } else if (this.maximumTry == 5) {
      this.toastr.warning("Hai solo 5 tentativi disponibili per mischiare le tessere.");
    } else if (this.maximumTry == 3) {
      this.toastr.error("Hai solo 3 tentativi disponibili per mischiare le tessere.");
    }
  }
  youWon() {
    let partita = {
      punteggio: this.calculatePoints(),
      userId: this.user!.id,
      giocoId: this.gioco.id,
      esito: "VINTA"
    }

    this.gameFieldService.putPartita(this.selectedPartita, partita).subscribe({
      next: (partita: any) => {
        this.partiteGiocate++;
      }
    })
    this.toastr.success("Congratulazioni! \n Hai vinto!");
    this.gameEnd = true;
    this.victory = true;
    this.firstFloor = [];
    this.secondFloor = [];
    this.thirdFloor = [];
    this.fourthFloor = [];
    this.allCards = [];
    this.allTessers = [];
    this.mixedAllCards = [];
    clearInterval(this.countTimer);
    clearTimeout(this.countCount);
  }

  giveUp() {
    let partite: any[] = [];
    let partita = {
      punteggio: this.calculatePoints(),
      userId: this.user!.id,
      giocoId: this.gioco.id,
      esito: "PERSA"
    }
    partite.push(partita);
    if (!this.selectedPartita) {
      this.gameFieldService.postPartite(partite).subscribe({
        next: (value: any) => {
          this.partiteGiocate++;
        }
      });
    }
    this.gameEnd = true;
    this.victory = false;
    this.firstFloor = [];
    this.secondFloor = [];
    this.thirdFloor = [];
    this.fourthFloor = [];
    this.allCards = [];
    this.allTessers = [];
    this.mixedAllCards = [];
    clearInterval(this.countTimer);
    clearTimeout(this.countCount);
  }
}
