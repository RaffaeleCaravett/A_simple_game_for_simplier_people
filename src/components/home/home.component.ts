import { NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ModeService } from '../../services/mode.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  starCount: number = 0;
  interval: any;
  mode:string = 'light';
  constructor(private modeService:ModeService) {
    this.modeService.mode.subscribe((data:string)=>{
      this.mode=data;
    })
   }

  rotate(id: string) {
    let div = document.querySelector(`#${id}`) as HTMLDivElement;
    div.style.transition = '1s';
    div.style.transform = 'rotateY(180deg)';
  }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {


    this.interval = setInterval(() => {

      let starContainer = document.querySelector('.star-container');
      if (this.starCount == 6) {
        starContainer!.innerHTML = ''
        this.starCount = 0;
        return;
      }
      starContainer?.classList.add('py-5')
      let img = document.createElement('img') as HTMLImageElement;
      img.src = 'assets/home/star.png';
      img.style.width = '50px';
      img.style.height = '50px';
      img.classList.add('m-auto');
      if (this.starCount == 5) {
        starContainer!.innerHTML = ''
        this.starCount = 0;
      }
      this.starCount++;
    }, 1500);
  }
  ngOnDestroy(): void {
    clearInterval(this.interval);
  }
}
