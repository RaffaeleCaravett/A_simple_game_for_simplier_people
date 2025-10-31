import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrisComponent } from './components/tris/tris.component';
import { MemoryComponent } from './components/memory/memory.component';
import { MahJongComponent } from './components/mah-jong/mah-jong.component';
import { ScopaComponent } from './components/scopa/scopa.component';
import { PartitaDouble } from '../../interfaces/interfaces';
import { GamefieldService } from '../../services/gamefield.service';

@Component({
  selector: 'app-game-field',
  standalone: true,
  imports: [NgIf, TrisComponent, MemoryComponent, MahJongComponent, ScopaComponent],
  templateUrl: './game-field.component.html',
  styleUrl: './game-field.component.scss'
})
export class GameFieldComponent implements OnInit, OnDestroy {
  game: number = 0;
  partitaDouble: PartitaDouble | null = null;
  constructor(private route: ActivatedRoute, private router: Router, private gameFieldService: GamefieldService) {
    this.route.queryParams.subscribe(
      params => {
        if (params && params['gioco'])
          this.game = JSON.parse(params['gioco']);
        if (params && params['partita'])
          this.partitaDouble = JSON.parse(params['partita']);
      });
    this.gameFieldService.partitaDouble.subscribe((data: PartitaDouble | null) => {
      if (data) {
        this.partitaDouble = data;
      }
    })
    if (localStorage.getItem('game')) {
      this.game = Number(localStorage.getItem('game')!);
    }
    if (this.game == undefined || this.game == 0 || this.game == null) {
      this.router.navigate(['/'])
    }
  }

  ngOnInit(): void {
    localStorage.setItem('location', `game-field`);
    localStorage.setItem('game', String(this.game));
  }


  ngOnDestroy(): void {
    localStorage.removeItem('game');
  }

}


