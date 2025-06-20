import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GiochiService } from '../../services/giochi.service';
import { Subscriber, throttleTime } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { GiocoPreviewComponent } from '../../shared/components/gioco-preview/gioco-preview.component';
import { FormControl, FormGroup } from '@angular/forms';
import { RecensioniComponent } from '../../shared/components/recensioni/recensioni.component';
import { User } from '../../interfaces/interfaces';
import { Router } from '@angular/router';
import { RecensioneService } from '../../services/recensione.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-giochi',
  templateUrl: './giochi.component.html',
  styleUrl: './giochi.component.scss'
})
export class GiochiComponent implements OnInit, OnDestroy {
  giochi: any[] = [];
  circles: number[] = [1, 2, 3, 4, 5];
  searchGiocoForm: FormGroup = new FormGroup({});
  points: number[] = [1, 2, 3, 4];
  difficulties: number[] = [1, 2, 3, 4];
  validationPoints: number[] = [1, 2, 3, 4, 5];
  page: number = 0;
  size: number = 2;
  orderBy: string = "id";
  sortOrder: string = "ASC";
  body: { nome: string, difficolta: number, punteggio: number } = {
    nome: this.searchGiocoForm.get('nomeGioco')?.value || null,
    difficolta: this.searchGiocoForm.get('difficolta')?.value || null,
    punteggio: this.searchGiocoForm.get('punteggioRecensioniDa')?.value || null
  };
  isLoading: boolean = false;
  maxPages: number = 1;
  sizes: number[] = [2, 5, 10]
  windowWidth: number = 0;
  @Input() user: User | null = null;
  timeout: any = null;
  @Output() canSwitchLocation: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  @Input() mode: string = 'light';
  constructor(private giochiService: GiochiService, private matDialog: MatDialog, private router: Router,
    private recensioniService: RecensioneService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.initializeGiocoForm();
    this.getGiochi(false, this.body);
    this.onResize();
  }
  ngOnDestroy(): void {
    this.isLoading = false;
    clearTimeout(this.timeout);
  }

  getGiochi(origin: boolean, body: { nome: string, difficolta: number, punteggio: number }, isActive?: boolean) {
    this.canSwitchLocation.emit(false);
    this.searchGiocoForm.get('size')?.value != '' &&
      this.searchGiocoForm.get('size')?.value != undefined &&
      this.searchGiocoForm.get('size')?.value != null ?
      this.size = this.searchGiocoForm.get('size')?.value : '';
    this.searchGiocoForm.get('orderBy')?.value != '' &&
      this.searchGiocoForm.get('orderBy')?.value != undefined &&
      this.searchGiocoForm.get('orderBy')?.value != null ?
      this.orderBy = this.searchGiocoForm.get('orderBy')?.value : '';
    this.searchGiocoForm.get('sortOrder')?.value != '' &&
      this.searchGiocoForm.get('sortOrder')?.value != undefined &&
      this.searchGiocoForm.get('sortOrder')?.value != null ?
      this.sortOrder = this.searchGiocoForm.get('sortOrder')?.value : ''
    this.isLoading = true;
    setTimeout(() => {
      if (this.isLoading) {
        window.location.reload();
        this.toastr.show("Abbiamo refreshato la pagina per te!");
      }
    }, 6000)
    this.giochiService.searchGiochi(body, this.page, this.size, this.orderBy, this.sortOrder, true).pipe(throttleTime(1000)).subscribe({
      next: (data: any) => {
        if (!origin) data?.content?.map((g: any) => { this.giochi.push(g) })
        else this.giochi = data?.content
        this.giochi.filter((g: any) => {
          g.image = this.readGiocoImage(g?.image)
        })
        this.maxPages = data.totalPages;
        this.timeout = setTimeout(() => {
          this.isLoading = false;
          setTimeout(() => {
            this.canSwitchLocation.emit(true);
          }, 200)
        }, 300)
      }
    })
  }
  readGiocoImage(image: any) {
    if (image.startsWith("data:image/png;base64,")) return image;
    return "data:image/png;base64," + image;
  }
  openGameDialog(gioco: any) {
    const dialogRef = this.matDialog.open(GiocoPreviewComponent, {
      data: gioco,
      width: '50%',
      height: '90%'
    })
    dialogRef.afterClosed().subscribe((data: any) => { if (data) this.router.navigate(['/game-field'], { queryParams: { gioco: gioco.id } }); })
  }

  initializeGiocoForm() {
    this.searchGiocoForm = new FormGroup({
      nomeGioco: new FormControl(''),
      difficolta: new FormControl(),
      punteggioRecensioniDa: new FormControl(''),
      size: new FormControl(''),
      orderBy: new FormControl('id'),
      sortOrder: new FormControl('ASC')
    })
  }

  searchGiochi(from?: string) {
    this.body = {
      nome: this.searchGiocoForm.get('nomeGioco')?.value,
      difficolta: this.searchGiocoForm.get('difficolta')?.value,
      punteggio: this.searchGiocoForm.get('punteggioRecensioniDa')?.value
    };
    let origin: boolean = false;
    if (from) { origin = true; this.page != 0 ? this.page = 0 : ''; };
    this.getGiochi(origin, this.body);
  }
  onScroll(event: any) {
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 5 && !this.isLoading) {
      this.page += 1;
      if (this.page < this.maxPages) {
        this.searchGiochi();
      }
    }
  }
  rateGame(gioco: any) {
    const dialogRef = this.matDialog.open(RecensioniComponent, { data: gioco, width: '90%', height: '90%' })
    dialogRef.afterClosed().subscribe((data: any) => {
      this.checkAlertReces();
    })
  }

  goToProfile(user: User) {
    this.router.navigate(['/lobby/profile'], { queryParams: { user: user.id } })
  }
  @HostListener('window:resize', ["$event"])
  onResize() {
    this.windowWidth = window.innerWidth;
  }

  checkAlertReces() {
    this.recensioniService.alertReces.subscribe((bool: boolean) => {
      if (bool) {
        this.page != 0 ? this.page = 0 : '';
        this.getGiochi(true, this.body);
      }
    })
  }
  isPreferred(gioco: any) {
    return this.user?.preferiti?.find(g => g.gioco.id == gioco.id);
  }
  addToFavourites(gioco: any) {
    let preferitiDTO = {
      gioco_id: gioco.id,
      user_id: this.user!.id
    }
    this.giochiService.addToFavourites(preferitiDTO).subscribe({
      next: (resp: any) => {
        this.user?.preferiti.push(resp);
      }
    })
  }
  removeFromFavourites(gioco: any) {
    let preferitoId = 0;
    this.user?.preferiti.forEach((p: any) => {
      if (p.gioco.id == gioco.id) {
        preferitoId = p.id;
      }
    });

    this.giochiService.removeFromFavourites(preferitoId!).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.user!.preferiti = this.user!.preferiti.filter(p => p?.gioco?.id != gioco.id);
        }
      }
    })
  }
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: any) {
    if (event && event?.code && event?.code == 'Enter') {
      this.searchGiochi('yes');
    }
  }
}
