import { AfterContentChecked, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../interfaces/interfaces';
import { ProfileServive } from '../../services/profile.service';
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { GamefieldService } from '../../services/gamefield.service';
import { GiocoPreviewComponent } from '../../shared/components/gioco-preview/gioco-preview.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { ImpostazioniComponent } from './components/impostazioni/impostazioni.component';
import { PreferitiComponent } from '../preferiti/preferiti.component';
import { ModeService } from '../../services/mode.service';
import { LeafletComponent } from '../../shared/components/leaflet/leaflet.component';
import { HttpClient } from '@angular/common/http';
import { GoogleMap, MapAdvancedMarker, MapMarker } from '@angular/google-maps';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DescrizioneComponent } from './components/descrizione/descrizione.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, ImpostazioniComponent, NgStyle, PreferitiComponent, LeafletComponent, GoogleMap, MapMarker, MapAdvancedMarker, ReactiveFormsModule, DescrizioneComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, AfterContentChecked {
  id: number = 0;
  visitedUser!: User | null;
  user!: User;
  recePage: number = 0;
  receSize: number = 5;
  receOrderBy: string = 'punteggio';
  receSortOrder: string = 'ASC';
  recensioni: any = null;
  giochiPage: number = 0;
  giochiSize: number = 5;
  giochiOrderBy: string = 'id';
  giochiSortOrder: string = 'ASC';
  giochi: any = null;
  validationPoints: number[] = [1, 2, 3, 4, 5]
  gioco: any = null;
  ordinaArray: { label: string, values: string[] }[] = [
    { label: 'Punteggio migliore', values: ['punteggio', 'DESC'] },
    { label: 'Punteggio peggiore', values: ['punteggio', 'ASC'] },
    { label: 'Più recente', values: ['createdAt', 'DESC'] },
    { label: 'Meno recente', values: ['createdAt', 'ASC'] }];
  ordinaGiocoArray: { label: string, values: string[] }[] = [
    { label: 'Nome discendente', values: ['nomeGioco', 'DESC'] },
    { label: 'Nome ascendente', values: ['nomeGioco', 'ASC'] },
    { label: 'Difficoltà minore', values: ['difficolta', 'ASC'] },
    { label: 'Difficoltà maggiore', values: ['difficolta', 'DESC'] }];
  ordinaPartiteArray: { label: string, values: string[] }[] = [
    { label: 'Id ascendente', values: ['id', 'ASC'] },
    { label: 'Id discendente', values: ['id', 'DESC'] },
    { label: 'Punteggio migliore', values: ['punteggio.punteggio', 'DESC'] },
    { label: 'Punteggio peggiore', values: ['punteggio.punteggio', 'ASC'] },
    { label: 'Nome gioco discendente', values: ['gioco.nomeGioco', 'DESC'] },
    { label: 'Nome gioco ascendente', values: ['gioco.nomeGioco', 'ASC'] },
    { label: 'Difficoltà maggiore', values: ['gioco.difficolta', 'DESC'] },
    { label: 'Difficoltà minore', values: ['gioco.difficolta', 'ASC'] },
    { label: 'Più recente', values: ['createdAt', 'DESC'] },
    { label: 'Meno recente', values: ['createdAt', 'ASC'] },
    { label: 'Esito partita discendente', values: ['esito', 'DESC'] },
    { label: 'Esito partita ascendente', values: ['esito', 'ASC'] }];


  sizes: number[] = [2, 5, 10];
  windowWidth: number = 0;
  menuVoices: Set<{ label: string, emoji: string }> = new Set([{ label: 'Profilo', emoji: '🪪' }, { label: 'Recensioni', emoji: '✅' }, { label: 'Giochi', emoji: '🕹️' }, { label: 'Trofei', emoji: '🏅' }, { label: 'Classifiche', emoji: '📋' }, { label: 'Partite', emoji: '🥅' }, { label: 'Preferiti', emoji: '❤️' }]);
  section: string = 'Profilo';
  circles: number[] = [1, 2, 3, 4, 5];
  partitePage: number = 0;
  partiteSize: number = 20;
  partiteOrderBy: string = 'id';
  partiteSortOrder: string = 'ASC';
  partite: any = null;
  classifichePage: number = 0;
  classificheSize: number = 6;
  classificheOrderBy: string = 'id';
  classificheSortOrder: string = 'ASC';
  classifiche: any = null;
  trofeiPage: number = 0;
  trofeiSize: number = 9;
  trofeiOrderBy: string = 'id';
  trofeiSortOrder: string = 'ASC';
  trofei: any = null;
  firstTimeReces: number = 0;
  sottomenu: string[] = ['🖼️Cambia immagine del profilo', '🔒 Cambia la password', 'ℹ️ Cambia altre informazioni', '📞 Richiedi assistenza', '📨 Monitora le tue richieste'];
  impostazioniSection: string = 'Richiedi assistenza';
  mode: string = 'light';
  cityX: number = 0;
  cityY: number = 0;
  mapOptions!: google.maps.MapOptions;
  markers = [
    { lat: 40.73061, lng: -73.935242 },
    { lat: 40.74988, lng: -73.968285 }
  ];
  descrizioneForm: FormGroup = new FormGroup({});
  showMenu: boolean = false;
  constructor(private route: ActivatedRoute, private router: Router, private profiloService: ProfileServive, private gamefieldService: GamefieldService, private matDialog: MatDialog,
    public authService: AuthService, private modeService: ModeService, private httpClient: HttpClient, private toastr: ToastrService, private cdr: ChangeDetectorRef) {
    this.authService.isAuthenticatedUser.subscribe((bool: boolean) => {
      this.user = this.authService.getUser()!;
      this.getAllDatas();
      if (this.visitedUser?.id == this.user?.id) {
        this.visitedUser = this.authService.getUser()!;
        this.getCoordinates();
        let yesImpostazioni: boolean = false;
        this.menuVoices.forEach((d) => {
          if (d.label == 'Impostazioni') {
            yesImpostazioni = true;
          }
        });
        if (!yesImpostazioni) this.menuVoices.add({ label: 'Impostazioni', emoji: '⚙️' });
        this.menuVoices.delete({ label: 'Preferiti', emoji: '❤️' });
        localStorage.setItem('visitedUser', JSON.stringify(this.visitedUser));
      }
    });
    this.modeService.mode.subscribe((data: string) => {
      this.mode = data;
    })
  }

  ngOnInit(): void {
    this.descrizioneForm = new FormGroup({
      descrizione: new FormControl('', [Validators.required, Validators.maxLength(5000)])
    })
    this.route.queryParams.subscribe(
      params => {
        if (params && params['user']) {
          this.authService.getUserById(params['user']).subscribe({
            next: (data: any) => {
              this.visitedUser = data;
              this.getCoordinates();
              if (this.user?.id == this.visitedUser?.id) {
                let yesImpostazioni: boolean = false;
                this.menuVoices.forEach((d) => {
                  if (d.label == 'Impostazioni') {
                    yesImpostazioni = true;
                  }
                });
                if (!yesImpostazioni) this.menuVoices.add({ label: 'Impostazioni', emoji: '⚙️' });
                this.menuVoices.delete({ label: 'Preferiti', emoji: '❤️' });
              }
              this.getAllDatas();
              if (this.visitedUser != null && this.visitedUser != undefined) localStorage.setItem('visitedUser', JSON.stringify(this.visitedUser));
              else this.router.navigate(['/lobby']);
            }
          })
        } else {
          if (!localStorage.getItem('visitedUser')) this.router.navigate(['/lobby']);
          else {
            this.visitedUser = JSON.parse(localStorage.getItem('visitedUser')!);
            this.getCoordinates();
            if (this.user?.id == this.visitedUser?.id) {
              let yesImpostazioni: boolean = false;
              this.menuVoices.forEach((d) => {
                if (d.label == 'Impostazioni') {
                  yesImpostazioni = true;
                }
              });
              if (!yesImpostazioni) this.menuVoices.add({ label: 'Impostazioni', emoji: '⚙️' });
              this.menuVoices.delete({ label: 'Preferiti', emoji: '❤️' });
            }
            this.getAllDatas();
          }
        }
      }
    )
    localStorage.setItem('location', 'lobby/profile')
  }

  getAllDatas() {
    this.getGiochi();
    this.getPartite();
    this.getClassifiche();
    this.getTrofei();
    this.getRecensioni();
    this.onResize();
  }

  getRecensioni() {
    this.profiloService.getRecensioniByUserId(this.visitedUser!.id, this.recePage, this.receSize, this.receOrderBy, this.receSortOrder).subscribe({
      next: (reces: any) => {
        this.recensioni = reces;
      }
    })
  }
  getGiochi() {
    this.profiloService.getGiochiByUserId(this.visitedUser!.id, this.giochiPage, this.giochiSize, this.giochiOrderBy, this.giochiSortOrder).subscribe({
      next: (games: any) => {
        this.giochi = games;
      }
    })
  }
  getPartite() {
    this.gamefieldService.getPartitaByUser(this.visitedUser!.id, this.partitePage, this.partiteSize, this.partiteOrderBy, this.partiteSortOrder).subscribe({
      next: (partite: any) => {
        this.partite = partite;
      }
    })
  }
  getClassifiche() {
    this.gamefieldService.getClassificheByUser(this.visitedUser!.id, this.classifichePage, this.classificheSize, this.classificheOrderBy, this.classificheSortOrder).subscribe({
      next: (classifiche: any) => {
        this.classifiche = classifiche;
      }
    })
  }
  getTrofei() {
    this.gamefieldService.getTrofeiByUser(this.visitedUser!.id, this.trofeiPage, this.trofeiSize, this.trofeiOrderBy, this.trofeiSortOrder).subscribe({
      next: (trofei: any) => {
        this.trofei = trofei;
      }
    })
  }
  toNumber(element: string) {
    return Number(element);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth > 699) this.showMenu = false
  }

  openGameDialog(gioco: any) {
    const dialogRef = this.matDialog.open(GiocoPreviewComponent, {
      data: gioco,
      width: '50%',
      height: '90%'
    })
    dialogRef.afterClosed().subscribe((data: any) => { if (data) this.router.navigate(['/game-field'], { queryParams: { gioco: gioco.id } }); })
  }

  switchSection(value: string) {
    this.section = value;
    if (this.section != 'Profilo') {
      this.returnDescrizione = 0;
    }
  }

  calculateEsito(esito: string): string {
    switch (esito) {
      case ("VINTA"): {
        return "text-success"
      }
      case ("PAREGGIATA"): {
        return "text-warning"
      }
      case ("PERSA"): {
        return "text-danger"
      }
      case ("VALIDA"): {
        return "text-success"
      }
      case ("NON_VALIDA"): {
        return "text-danger"
      }
      default: {
        return "";
      }
    }
  }

  goToRanking(c: any) {
    this.router.navigate(['/lobby'], { queryParams: { classificaId: c?.id, section: 'classifiche' } });
  }

  setImpostazioniSection(s: string) {
    this.impostazioniSection = s.substring(3);
    console.log(this.impostazioniSection)
  }
  getCoordinates() {
    if (this.visitedUser?.completed) {
      const countryName = this.visitedUser.citta.nome;
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        countryName
      )}&key=${'9ea660b591574bbcb9e3530619d63fff'}`;
      try {
        this.httpClient.get(url).subscribe({
          next: (response: any) => {
            const result = response.results[0];

            if (result) {
              const { lat, lng } = result.geometry;

              this.cityX = lat;
              this.cityY = lng;
              this.mapOptions = {
                mapId: "DEMO_MAP_ID",
                center: { lat: this.cityX, lng: this.cityY },
                zoom: 7
              };
            }
          }
        })
      } catch (error: any) {
        this.toastr.warning("Non siamo riusciti a recuperare le tue coordinate.");
        this.mapOptions = {
          mapId: "DEMO_MAP_ID",
          zoom: 7
        };
      }

    }
  }
  returnDescrizione: number = 0;
  showDescrizione(descr: HTMLDivElement, descrizione: string) {
    if (this.returnDescrizione < 1) {
      let div = document.createElement('div') as HTMLDivElement;
      div.innerHTML = descrizione;
      this.returnDescrizione += 1;
      return descr.innerHTML += div.outerHTML;
    }
    return;
  }
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }
  formatDate(date: string) {
    let newDate = new Date(date);
    return newDate.getDate() + '/' + newDate.getMonth() + 1 + '/' + newDate.getFullYear();
  }
}
