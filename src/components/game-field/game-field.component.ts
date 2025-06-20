import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrisComponent } from './components/tris/tris.component';
import { MemoryComponent } from './components/memory/memory.component';
import { MahJongComponent } from './components/mah-jong/mah-jong.component';

@Component({
  selector: 'app-game-field',
  standalone: true,
  imports: [NgIf,TrisComponent,MemoryComponent,MahJongComponent],
  templateUrl: './game-field.component.html',
  styleUrl: './game-field.component.scss'
})
export class GameFieldComponent implements OnInit, OnDestroy{
  game: number = 0;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.queryParams.subscribe(
      params => {
        this.game = JSON.parse(params['gioco']);
      })
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


