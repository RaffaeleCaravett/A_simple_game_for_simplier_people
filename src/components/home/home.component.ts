import { NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ModeService } from '../../services/mode.service';
import { browserRefresh } from '../../app/app.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  windowWidth: number = 0;
  starCount: number = 0;
  interval: any;
  mode: string = 'light';
  balls: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  constructor(private modeService: ModeService) {
    this.modeService.mode.subscribe((data: string) => {
      this.mode = data;
    })
  }

  rotate(id: string) {
    let div = document.querySelector(`#${id}`) as HTMLDivElement;
    div.style.transition = '1s';
    div.style.transform = 'rotateY(180deg)';
  }

  ngOnInit(): void {
    this.onResize();
    if (!browserRefresh) {
      localStorage.setItem('location', '')
    }
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

  @HostListener('window:resize', ['event'])
  onResize(event?: any) {
    this.windowWidth = window.innerWidth;
    let father = document.querySelector('.cards-container');
    let father1 = document.getElementsByClassName('rotate-ts')!;
    Array.from(father?.children!).forEach((e: any, a: any) => {
      if (window.innerWidth <= 400) {
        e.children[0].style = "left:0;"
      } else {
        a == 0 || a == 2 ? e.children[0].style = "left:-8%;" : e.children[0].style = "left:10%;"
      }
    })
    Array.from(father1).forEach((e: Element) => {
      let div = e as HTMLDivElement;
      if (window.innerWidth <= 400) {
        div.classList.add("rotate-ts-important")
      } else {
        div.classList.remove("rotate-ts-important")
      }
    })
  }
}
