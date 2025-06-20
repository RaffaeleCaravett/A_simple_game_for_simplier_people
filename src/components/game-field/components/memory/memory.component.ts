import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { User } from '../../../../interfaces/interfaces';
import { AuthService } from '../../../../services/auth.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { SharedModule } from '../../../../shared/modules/shared.module';
import { GamefieldService } from '../../../../services/gamefield.service';

@Component({
  selector: 'app-memory',
  standalone: true,
  imports: [NgIf, NgClass, SharedModule, NgFor],
  templateUrl: './memory.component.html',
  styleUrl: './memory.component.scss'
})
export class MemoryComponent implements OnInit, OnDestroy {

  @Input() game!: number;
  user: User | null = null;
  step: number = 0;
  difficolta: string = '';
  remainingCardToFind: number = 0;
  cards: number[] = [];
  secondsToFlip: number = 0;
  downgradeSecondsInterval: any = null;
  showSpinner: boolean = false;
  officialCards: number[] = [];
  isCardGiven: boolean = false;
  givenCard: number = 0;
  rigioca: boolean = false;
  punti: number = 5;
  isDivClicked: number = 0;
  partite: any[] = [];
  totalPartite: number = 0;
  constructor(private authService: AuthService, private gamefieldService: GamefieldService) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    this.step = 1;
    this.getPartite();
  }


  go(value?: string) {
    this.difficolta = value || this.difficolta;
    if (this.difficolta == 'bassa') this.remainingCardToFind = 5;
    else if (this.difficolta == 'media') this.remainingCardToFind = 10;
    else this.remainingCardToFind = 20;
    this.step++
    if (this.step == 3) this.giveCards();
  }

  giveCards() {
    this.totalPartite += 1;
    this.partite.push(
      {
        esito: "NON_VALIDA",
        userId: this.user!.id,
        giocoId: this.game,
        punteggio: this.punti
      }
    )
    this.showSpinner = true;
    this.cards = [];
    this.isCardGiven = false;
    this.isDivClicked = 0;
    this.punti = 5;
    this.remainingCardToFind = this.difficolta == 'bassa' ? this.remainingCardToFind = 5 : this.difficolta == 'media' ? this.remainingCardToFind = 10 : this.difficolta == 'alta' ? 20 : 0;

    setTimeout(() => {
      for (let i = 1; i <= this.remainingCardToFind; i++) {
        this.cards.push(i);
      }
      for (let i = 0; i <= this.cards.length - 1; i++) {
        let randomNumber = Math.round(Math.random() * (this.cards.length - 1));
        if (randomNumber < 0) randomNumber = 0;
        let number = this.cards[i];
        this.cards[i] = this.cards[randomNumber];
        this.cards[randomNumber] = number;
      }
    }, 2000)
    setTimeout(() => {
      for (let i = 0; i <= this.cards.length - 1; i++) {
        setTimeout(() => {
          this.showSpinner = false;
          this.officialCards.push(this.cards[i]);
          if (i == this.cards.length - 1) this.evaluateSecondsToFlip();
        }, i * 200)
      }
    }, 3500)
  }
  handleClickEvent(event: any) {
    event.preventDefault();
  }

  evaluateSecondsToFlip() {
    switch (this.difficolta) {
      case 'bassa': {
        this.secondsToFlip = 1;
        break;
      }
      case 'media': {
        this.secondsToFlip = 2;
        break;
      }
      case 'alta': {
        this.secondsToFlip = 3;
        break;
      }
      default: {
        break;
      }
    }
    this.downgradeSecondsInterval = setInterval(() => {
      if (this.secondsToFlip != 0) this.secondsToFlip -= 1;
      else this.flipCards();
    }, 1000)
  }

  flipCards() {
    clearInterval(this.downgradeSecondsInterval);
    setTimeout(() => {
      (document.getElementById('carte-field') as HTMLDivElement)!.childNodes.forEach((child: ChildNode, index: number) => {
        setTimeout(() => {
          if (child.nodeType && child.nodeType != 8) {
            (child as HTMLDivElement).style.transform = 'rotateY(180deg)';
            ((child as HTMLDivElement).childNodes[0] as HTMLDivElement).style.transform = 'rotateY(180deg)';
          }
        }, index * 200)
        if (index == (document.getElementById('carte-field') as HTMLDivElement)!.childNodes.length - 2) {
          this.giveCard();
        }
      }, 1000)
    });

  }

  initializeFlipCardStyle(div: any, type: string) {
    if (type && type == 'inner') {
      div.style.position = 'relative';
      div.style.width = '100%';
      div.style.height = '100%';
      div.style.textAlign = 'center';
      div.style.transition = 'transform 0.8s';
      div.style.transformStyle = 'preserve-3d';
    } else if (type && type == 'front') {
      div.style.backgroundColor = '#bbb';
    } else if (type && type == 'back') {
      div.style.transform = 'rotateY(180deg)';
    } else {

    }
    if (type && (type == 'front' || type == 'back')) {
      div.style.position = 'absolute';
      div.style.cursor = 'pointer!important';
      div.style.width = '100%';
      div.style.height = '100%';
      div.style.webkitBackfaceVisibility = 'hidden'; /* Safari */
      div.style.backfaceVisibility = 'hidden';
    }
  }

  checkCardEquals(event: any) {
    event.preventDefault();
    if (this.isCardGiven) {
      let clickedCard = event.target.parentElement.firstChild.textContent;
      if (clickedCard == this.givenCard) {
        this.isDivClicked = 0;
        this.officialCards = this.officialCards.filter(c => c != clickedCard);
        this.givenCard = 0;
        this.remainingCardToFind -= 1;
        this.giveCard();
      } else {
        this.isDivClicked += 1;
        event.target.textContent = '❌';
        event.target.style.fontSize = '30px';
        if (this.isDivClicked == 1 && this.difficolta == 'bassa') {
          this.punti -= 1;
        } else if (this.isDivClicked == 2 && this.difficolta == 'media') {
          this.punti -= 1;
        } else if (this.isDivClicked == 4 && this.difficolta == 'alta') {
          this.punti -= 1;
        }

        setTimeout(() => {
          event.target.textContent = '';
        }, 300);
      }

    }
  }

  giveCard() {
    this.isCardGiven = true;
    let randomNumber = Math.round(Math.random() * (this.officialCards.length - 1));

    if (randomNumber < 0) randomNumber = 0;
    setTimeout(() => {
      if (this.officialCards.length > 0) this.givenCard = this.officialCards[randomNumber];
      else {
        this.partite[this.partite.length - 1].esito = "VALIDA";
        this.rigioca = true;
        this.isCardGiven = false;
      }
    }, 1000)
  }

  ngOnDestroy(): void {
    this.gamefieldService.postPartite(this.partite).subscribe();
    localStorage.removeItem('partite');
  }

  @HostListener('window:beforeunload', ['$event'])
  onReload(event: any) {
    localStorage.setItem('partite', JSON.stringify(this.partite));
  }
  getPartite() {
    let localStoragePartite = localStorage.getItem('partite');
    if (localStoragePartite) {
      this.partite = JSON.parse(localStorage.getItem('partite')!);
      this.gamefieldService.postPartite(this.partite).subscribe({
        next: (data: any) => {
          this.gamefieldService.getPartitaByUserAndGioco(this.user!.id, this.game).subscribe((partite: any) => {
            this.totalPartite = partite?.totalElements;
          })
        }
      });
    } else {
      this.gamefieldService.getPartitaByUserAndGioco(this.user!.id, this.game).subscribe((partite: any) => {
        this.totalPartite = partite?.totalElements;
      })
    }
  }
}
