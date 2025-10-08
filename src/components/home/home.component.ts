import { isPlatformBrowser, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, HostListener, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ModeService } from '../../services/mode.service';
import { browserRefresh } from '../../app/app.component';
import { ChartModule } from 'primeng/chart';
import { HomeService } from '../../services/home.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ChartModule, ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  windowWidth: number = 0;
  starCount: number = 0;
  interval: any;
  mode: string = 'light';
  balls: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  data: any;
  options: any;
  platformId = inject(PLATFORM_ID);
  giochi: any = null;
  stars: number[] = [1, 2, 3, 4, 5];
  constructor(private modeService: ModeService, private cd: ChangeDetectorRef, private homeService: HomeService) {
    this.modeService.mode.subscribe((data: string) => {
      this.mode = data;
    })
  }
  sizeScroll(event: any, div: HTMLDivElement) {
    if (event.clientX < this.windowWidth / 2) {
      if (event.clientX < this.windowWidth / 2 - 300) {
        div.scrollLeft -= 8;
      }
    } else {
      if (event.clientX > this.windowWidth / 2 + 300) {
        div.scrollLeft += 8;
      }
    }
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
    this.initChart();
    this.getGiochi();
  }

  getGiochi() {
    this.homeService.getGiocoPreview().subscribe({
      next: (datas: any) => {
        this.giochi = datas;
      }
    })
  }
  initChart() {
    this.homeService.getStats().subscribe({
      next: (data: any) => {
        if (isPlatformBrowser(this.platformId)) {
          const documentStyle = getComputedStyle(document.documentElement);
          const textColor = documentStyle.getPropertyValue('--p-text-color');
          const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

          this.data = {
            datasets: [
              {
                data: [data?.categoriesCount, data?.userCount, data?.torneiCount, data?.gamesCount],
                backgroundColor: [
                  'red',
                  'orange',
                  'green',
                  'lightblue',
                ],
                label: 'Un po\' di numeri ...',

              }
            ],
            labels: ['Categorie disponibili', 'Utenti registrati', 'Numero di tornei', 'Giochi']
          };

          this.options = {
            plugins: {
              legend: {
                labels: {
                  color: textColor
                }
              }
            },
            scales: {
              r: {
                grid: {
                  color: surfaceBorder
                }
              }
            }
          };
          this.cd.markForCheck()
        }
      }
    })
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
    if (father?.children) {
      Array.from(father?.children!)?.forEach((e: any, a: any) => {
        if (window.innerWidth <= 400) {
          e.children[0].style = "left:0;"
        } else {
          a == 0 || a == 2 ? e.children[0].style = "left:-8%;" : e.children[0].style = "left:10%;"
        }
      })
    }
    if (father1) {
      Array.from(father1)?.forEach((e: Element) => {
        let div = e as HTMLDivElement;
        if (window.innerWidth <= 400) {
          div.classList.add("rotate-ts-important")
        } else {
          div.classList.remove("rotate-ts-important")
        }
      })
    }
  }
}
