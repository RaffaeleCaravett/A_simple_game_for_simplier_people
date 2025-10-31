import { AfterContentChecked, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectionRequestDTO, SocketDTO, User } from '../../interfaces/interfaces';
import { ProfileServive } from '../../services/profile.service';
import { JsonPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { GamefieldService } from '../../services/gamefield.service';
import { GiocoPreviewComponent } from '../../shared/components/gioco-preview/gioco-preview.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { ImpostazioniComponent } from './components/impostazioni/impostazioni.component';
import { ModeService } from '../../services/mode.service';
import { LeafletComponent } from '../../shared/components/leaflet/leaflet.component';
import { HttpClient } from '@angular/common/http';
import { GoogleMap, MapAdvancedMarker, MapMarker } from '@angular/google-maps';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DescrizioneComponent } from './components/descrizione/descrizione.component';
import { PreferitiComponent } from '../lobby/components/preferiti/preferiti.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EsitoRichiesta } from '../../enums/enums';
import { WebsocketService } from '../../services/websocket.service';
import { AskConfirmComponent } from '../../shared/components/ask-confirm/ask-confirm.component';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, ImpostazioniComponent, NgStyle, PreferitiComponent, LeafletComponent, GoogleMap, MapMarker,
    MapAdvancedMarker, ReactiveFormsModule, DescrizioneComponent, MatProgressSpinnerModule, MatTooltip,
    MatSlideToggleModule, FormsModule
  ],
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
  menuVoices: Set<{ label: string, emoji: string, title: string }> = new Set([{ label: 'Profilo', emoji: '🪪', title: 'Controlla il tuo profilo!' }, { label: 'Recensioni', emoji: '✅', title: 'Controlla le recensioni che hai lasciato!' }, { label: 'Giochi', emoji: '🕹️', title: 'Controlla i giochi a cui hai giocato!' }, { label: 'Trofei', emoji: '🏅', title: 'Controlla i trofei vinti!' }, { label: 'Tornei', emoji: '🏎️', title: 'Vai ai tornei!' }, { label: 'Classifiche', emoji: '📋', title: 'Controlla le tue classifiche!' }, { label: 'Partite', emoji: '🥅', title: 'Controlla le tue partite!' }, { label: 'Preferiti', emoji: '❤️', title: 'Controlla i tuoi preferiti!' },
  { label: 'Richieste', emoji: '🫂', title: 'Controlla le richieste di contatto!' },
  { label: 'Amici', emoji: '👥', title: 'Esplora i tuoi amici' }, { label: 'Dashboard', emoji: '📊', title: 'Controlla la tua dashboard!' }
  ]);
  section: string = 'Profilo';
  circles: number[] = [1, 2, 3, 4, 5];
  partitePage: number = 0;
  partiteSize: number = 21;
  partiteOrderBy: string = 'id';
  partiteSortOrder: string = 'ASC';
  selectedGame: number = 0;
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
  isProfileOpen: boolean = false;
  isConnectionRequestLoading: boolean = false;
  isThisAFriend: boolean = false;
  connectionRequestPage: number = 0;
  actualRequests: any = null;
  arp: number[] = [];
  actualRequestsSent: any = null;
  arps: number[] = [];
  requestStatus: string = "INVIATA";
  requestStatusArray: { value: EsitoRichiesta, label: string }[] = [{ value: EsitoRichiesta.INVIATA, label: 'Inviata' }, { value: EsitoRichiesta.ACCETTATA, label: 'Accettata' }, { value: EsitoRichiesta.RIFIUTATA, label: 'Rifiutata' },
  { value: EsitoRichiesta.ANNULLATA, label: 'Annullata' }
  ];
  isRequestLoading: boolean = false;
  requestToShow: string = 'RICEVUTE';
  requestToShowArray: { value: string, label: string }[] = [{ value: 'RICEVUTE', label: 'Ricevute' }, { value: 'EFFETTUATE', label: 'Effettuate' }];
  infoFriend: boolean = false;
  amici: any = null;
  giochiIdsAndNames: { id: number, name: string }[] = [];
  partiteForm: FormGroup = new FormGroup({});
  constructor(private route: ActivatedRoute, private router: Router, private profiloService: ProfileServive, private gamefieldService: GamefieldService, private matDialog: MatDialog,
    public authService: AuthService, private modeService: ModeService, private httpClient: HttpClient, private toastr: ToastrService, private cdr: ChangeDetectorRef,
    private websocketService: WebsocketService) {
    this.authService.isAuthenticatedUser.subscribe((bool: boolean) => {
      this.user = this.authService.getUser()!;
      this.getAllDatas();
      if (this.visitedUser?.id == this.user?.id) {
        this.visitedUser = this.authService.getUser()!;
        this.isProfileOpen = this.visitedUser?.open;
        this.getCoordinates();
        let yesImpostazioni: boolean = false;
        this.menuVoices.forEach((d) => {
          if (d.label == 'Impostazioni') {
            yesImpostazioni = true;
          }
        });
        if (!yesImpostazioni) this.menuVoices.add({ label: 'Impostazioni', emoji: '⚙️', title: 'Vai alle impostazioni' });
        this.menuVoices.delete({ label: 'Preferiti', emoji: '❤️', title: 'Controlla i tuoi preferiti!' });
        localStorage.setItem('visitedUser', JSON.stringify(this.visitedUser));
      }
    });
    this.modeService.mode.subscribe((data: string) => {
      this.mode = data;
    });
    this.profiloService.showRichiestaSpinner.subscribe((data: boolean) => {
      this.isConnectionRequestLoading = data;
      this.isRequestLoading = false;
    });
  }
  openInfoFriend() {
    this.infoFriend = !this.infoFriend;
  }
  acceptRequest(requestId: number) {
    let proceed: boolean = false;
    const dialogRef = this.matDialog.open(AskConfirmComponent, { data: [null, null, 'Accetta'], width: '60%', height: '300px' });

    dialogRef.afterClosed().subscribe((data: boolean) => {
      if (data) {
        proceed = true;
        this.profiloService.acceptRequest(requestId).subscribe({
          next: (data: any) => {
            this.getConnectionRequests();
            this.toastr.show("Richiesta accettata!");
          }
        });
      } else {
        this.toastr.show("Non è stata accettata nessuna modifica!");
      }
    });
  }
  refuseRequest(requestId: number) {
    let proceed: boolean = false;
    const dialogRef = this.matDialog.open(AskConfirmComponent, { data: [null, null, 'Rifiuta'], width: '60%', height: '300px' });

    dialogRef.afterClosed().subscribe((data: boolean) => {
      if (data) {
        proceed = true;
        this.profiloService.refuseRequest(requestId).subscribe({
          next: (data: any) => {
            this.getConnectionRequests();
            this.toastr.show("Richiesta rifiutata!");
          }
        });
      } else {
        this.toastr.show("Non è stata rifiutata nessuna modifica!");
      }
    });
  }
  deleteRequest(requestId: number) {
    let proceed: boolean = false;
    const dialogRef = this.matDialog.open(AskConfirmComponent, { data: [null, null, 'Annulla'], width: '60%', height: '300px' });

    dialogRef.afterClosed().subscribe((data: boolean) => {
      if (data) {
        proceed = true;
        this.profiloService.deleteRequest(requestId).subscribe({
          next: (data: any) => {
            this.getConnectionRequests();
            this.toastr.show("Richiesta modificata!");
          }
        });
      } else {
        this.toastr.show("Non è stata annulata nessuna richiesta!");
      }
    });
  }
  resetPartite() {
    this.partiteForm.reset();
    this.partiteForm.updateValueAndValidity();
    this.selectedGame = 0;
    this.partiteSortOrder = 'ASC';
    this.partiteOrderBy = 'id';
  }
  ngOnInit(): void {
    this.descrizioneForm = new FormGroup({
      descrizione: new FormControl('', [Validators.required, Validators.maxLength(5000)])
    });
    this.partiteForm = new FormGroup({
      gioco: new FormControl(''),
      sort: new FormControl('')
    });
    this.route.queryParams.subscribe(
      params => {
        if (params && params['user']) {
          this.authService.getUserById(params['user']).subscribe({
            next: (data: any) => {
              this.visitedUser = data;
              this.isProfileOpen = this.visitedUser?.open || false;
              this.getCoordinates();
              if (this.user?.id == this.visitedUser?.id) {
                this.menuVoices = new Set([{ label: 'Profilo', emoji: '🪪', title: 'Controlla il tuo profilo!' }, { label: 'Recensioni', emoji: '✅', title: 'Controlla le recensioni che hai lasciato!' }, { label: 'Giochi', emoji: '🕹️', title: 'Controlla i giochi a cui hai giocato!' }, { label: 'Trofei', emoji: '🏅', title: 'Controlla i trofei vinti!' }, { label: 'Tornei', emoji: '🏎️', title: 'Vai ai tornei!' }, { label: 'Classifiche', emoji: '📋', title: 'Controlla le tue classifiche!' }, { label: 'Partite', emoji: '🥅', title: 'Controlla le tue partite!' }, { label: 'Preferiti', emoji: '❤️', title: 'Controlla i tuoi preferiti!' },
                { label: 'Richieste', emoji: '🫂', title: 'Controlla le richieste di contatto!' },
                { label: 'Amici', emoji: '👥', title: 'Esplora i tuoi amici' }, { label: 'Dashboard', emoji: '📊', title: 'Controlla la tua dashboard!' }
                ]);
                let yesImpostazioni: boolean = false;
                this.menuVoices.forEach((d) => {
                  if (d.label == 'Impostazioni') {
                    yesImpostazioni = true;
                  }
                });
                if (!yesImpostazioni) this.menuVoices.add({ label: 'Impostazioni', emoji: '⚙️', title: 'Vai alle impostazioni' });
                this.menuVoices.delete({ label: 'Preferiti', emoji: '❤️', title: 'Controlla i tuoi preferiti!' });
              } else {
                this.cleanMenu();
              }
              if (params['request']) {
                this.switchSection('Richieste');
              } else if (params['email']) {
                this.switchSection('Dashboard');
              } else if (params['tournament']) {
                this.switchSection('Tornei');
              }
              this.getAllDatas();
              this.checkIfFriend();
              this.getConnectionRequests();

              if (this.visitedUser != null && this.visitedUser != undefined) localStorage.setItem('visitedUser', JSON.stringify(this.visitedUser));
              else this.router.navigate(['/lobby']);
            }
          });
        } else {
          if (!localStorage.getItem('visitedUser')) this.router.navigate(['/lobby']);
          else {
            this.visitedUser = JSON.parse(localStorage.getItem('visitedUser')!);
            this.isProfileOpen = this.visitedUser?.open || false;
            this.getCoordinates();
            if (this.user?.id == this.visitedUser?.id) {
              this.menuVoices = new Set([{ label: 'Profilo', emoji: '🪪', title: 'Controlla il tuo profilo!' }, { label: 'Recensioni', emoji: '✅', title: 'Controlla le recensioni che hai lasciato!' }, { label: 'Giochi', emoji: '🕹️', title: 'Controlla i giochi a cui hai giocato!' }, { label: 'Trofei', emoji: '🏅', title: 'Controlla i trofei vinti!' }, { label: 'Tornei', emoji: '🏎️', title: 'Vai ai tornei!' }, { label: 'Classifiche', emoji: '📋', title: 'Controlla le tue classifiche!' }, { label: 'Partite', emoji: '🥅', title: 'Controlla le tue partite!' }, { label: 'Preferiti', emoji: '❤️', title: 'Controlla i tuoi preferiti!' },
              { label: 'Richieste', emoji: '🫂', title: 'Controlla le richieste di contatto!' },
              { label: 'Amici', emoji: '👥', title: 'Esplora i tuoi amici' }, { label: 'Dashboard', emoji: '📊', title: 'Controlla la tua dashboard!' }
              ]);
              let yesImpostazioni: boolean = false;
              this.menuVoices.forEach((d) => {
                if (d.label == 'Impostazioni') {
                  yesImpostazioni = true;
                }
              });
              if (!yesImpostazioni) this.menuVoices.add({ label: 'Impostazioni', emoji: '⚙️', title: 'Vai alle impostazioni' });
              this.menuVoices.delete({ label: 'Preferiti', emoji: '❤️', title: 'Controlla i tuoi preferiti!' });
            } else {
              this.cleanMenu();
            }
            this.getAllDatas();
            this.checkIfFriend();
            this.getConnectionRequests();
          }
        }
      }
    )
    localStorage.setItem('location', 'lobby/profile')
  }

  checkIfFriend() {
    if (this.user != this.visitedUser) {
      this.profiloService.checkIfFriend(this.user?.id, this.visitedUser!.id).subscribe({
        next: (value: any) => {
          this.isThisAFriend = value;
        }
      });
    } else {
      this.isThisAFriend = true;
    }
  }
  getAllDatas() {
    if (this.visitedUser) {
      this.getGiochi();
      this.getPartite();
      this.getClassifiche();
      this.getTrofei();
      this.getRecensioni();
      this.getGiochiIdsAndNames();
    }
    this.onResize();
  }
  getGiochiIdsAndNames() {
    this.gamefieldService.getGiochi().subscribe({
      next: (data: any) => {
        this.giochiIdsAndNames = data;
      }
    });
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
    this.gamefieldService.getPartitaByUser(this.visitedUser!.id, this.partitePage, this.partiteSize, this.partiteOrderBy, this.partiteSortOrder, this.selectedGame).subscribe({
      next: (partite: any) => {
        this.partite = partite;
      }
    });
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
  getConnectionRequests() {
    if (this.user.id == this.visitedUser!.id) {
      this.isRequestLoading = true;
      this.profiloService.getConnectionRequest(this.connectionRequestPage, null, this.user.id, null, this.user.fullName, this.requestStatus).subscribe((datas: any) => {
        setTimeout(() => {
          this.actualRequests = datas;
          for (let i = 1; i <= datas?.totalPages; i++) {
            this.arp.push(i);
          }
          this.isRequestLoading = false;
          this.checkIfFriend();
        }, 2000);
      });
      this.profiloService.getConnectionRequest(this.connectionRequestPage, this.user.id, null, this.user.fullName, null, this.requestStatus).subscribe((datas: any) => {
        setTimeout(() => {
          this.actualRequestsSent = datas;
          for (let i = 1; i <= datas?.totalPages; i++) {
            this.arps.push(i);
          }
          this.isRequestLoading = false;
          this.checkIfFriend();
        }, 2000);
      });
    };
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
    this.user = this.authService.getUser()!;
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
        return "text-danger-emphasis"
      }
      case ("VALIDA"): {
        return "text-success"
      }
      case ("NON_VALIDA"): {
        return "text-danger-emphasis"
      }
      default: {
        return "";
      }
    }
  }

  goToRanking(c: any) {
    this.router.navigate(['/lobby'], { queryParams: { classificaId: c?.id, section: 'classifiche' } });
  }
  goToProfile(user: User | any) {
    if (user && user?.id) {
      localStorage.setItem('visitedUser', JSON.stringify(user));
      this.section = 'Profilo';
      this.router.navigate([`/lobby/profile`], { queryParams: { user: user.id } });
    } else {
      this.authService.getUserById(user).subscribe({
        next: (data: any) => {
          var user = data;
          localStorage.setItem('visitedUser', JSON.stringify(user));
          this.section = 'Profilo';
          this.router.navigate([`/lobby/profile`], { queryParams: { user: user.id } });
        }
      });
    }
  }

  setImpostazioniSection(s: string) {
    this.impostazioniSection = s.substring(3);
  }
  cleanMenu() {
    if (this.user.id != this.visitedUser!.id) {
      this.menuVoices = new Set([{ label: 'Profilo', emoji: '🪪', title: 'Controlla il profilo!' }, { label: 'Recensioni', emoji: '✅', title: 'Controlla le recensioni!' }, { label: 'Giochi', emoji: '🕹️', title: 'Controlla i giochi !' }, { label: 'Trofei', emoji: '🏅', title: 'Controlla i trofei vinti!' }, { label: 'Tornei', emoji: '🏎️', title: 'Vai ai tornei!' }, { label: 'Classifiche', emoji: '📋', title: 'Controlla le classifiche!' }]);
    }
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
  formatDate(date: string | undefined) {
    if (date) {
      let newDate = new Date(date);
      return newDate.getDate() + '/' + newDate.getMonth() + 1 + '/' + newDate.getFullYear();
    } else {
      return "";
    }
  }
  sendRequest() {
    this.isConnectionRequestLoading = true;
    let request: ConnectionRequestDTO = {
      receiverId: this.visitedUser!.id
    }
    if (!this.isThisAFriend) {
      this.profiloService.sendConnectionRequest(request).subscribe({
        next: (data: any) => {
          this.toastr.show("E' stata mandata la richiesta verso " + this.visitedUser?.fullName + ". ");
          this.isConnectionRequestLoading = false;
          let socketDTO: SocketDTO = {
            messageDTO: null,
            moveDTO: null,
            connectionDTO: null,
            gameConnectionDTO: null,
            connectionRequestDTO: { receiverId: this.visitedUser!.id },
            invitoDTO: null,
            scopaHand: null
          }
          this.websocketService.send(socketDTO);
        }
      });
    } else {
      const dialog = this.matDialog.open(AskConfirmComponent, { data: [null, null, 'Elimina'], });
      dialog.afterClosed().subscribe((data: any) => {
        if (data) {
          this.profiloService.deleteRequestByIds(this.visitedUser!.id).subscribe({
            next: (data: any) => {
              if (data) {
                this.toastr.show("E' stato annullato il collegamento con " + this.visitedUser?.fullName + ". ");
                this.isConnectionRequestLoading = false;
                this.getConnectionRequests();
                this.openInfoFriend();
              }
            }
          });
        }
      });
    }
  }
}
