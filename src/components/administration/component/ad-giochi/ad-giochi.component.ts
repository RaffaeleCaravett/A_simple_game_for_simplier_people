import { NgFor, NgIf } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { AdministrationService } from '../../../../services/administration.service';

@Component({
  selector: 'app-ad-giochi',
  standalone: true,
  imports: [NgIf, MatMenuModule, NgFor],
  templateUrl: './ad-giochi.component.html',
  styleUrl: './ad-giochi.component.scss'
})
export class AdGiochiComponent implements OnInit {
  innerWidth: number = 0;
  items: string[] = ["Supervisiona giochi", "Modifica un gioco", "Cancella un gioco"];
  action:string = "";
  constructor(private administrationService: AdministrationService) { }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerWidth = window.innerWidth;
  }

  handleAction(action:string){
    switch(action){
      case("Supervisiona giochi"):{

      }
      break;
      case("Modifica un gioco"):{

      }
      break;
      case("Cancella un gioco"):{

      }
      break;
      default:{}
    }
  }
}
