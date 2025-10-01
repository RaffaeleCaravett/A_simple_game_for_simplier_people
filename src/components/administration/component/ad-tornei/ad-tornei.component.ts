import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from "@angular/common";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { AdministrationService } from '../../../../services/administration.service';
import { ToastrService } from 'ngx-toastr';
import { MatTooltip } from "@angular/material/tooltip";
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-ad-tornei',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule, MatTooltip],
  templateUrl: './ad-tornei.component.html',
  styleUrl: './ad-tornei.component.scss'
})
export class AdTorneiComponent implements OnInit {

  selectedTorneo: any = null;
  tornei: any = null;
  page: number = 0;
  size: number = 10;
  orderBy: string = 'id';
  nome: string = '';
  stato: string = '';
  dataCreazione: string = '';
  dataInizio: string = '';
  dataFine: string = '';
  nomeGioco: string = '';
  filters: string[] = ["Pagina", "Elementi", "Ordina", "Nome", "Stato", "Creazione", "Inizio", "Fine", "Gioco"];
  maxPage: number | null = null;
  filtersForm: FormGroup = new FormGroup({});

  constructor(private administration: AdministrationService, private toastr: ToastrService, private matDialog: MatDialog) { }

  ngOnInit(): void {
    localStorage.setItem('action', 'tornei');
    localStorage.setItem('location', 'amministrazione/tornei');
    this.initializeForms();
    this.getTornei();
  }

  giveBackArray(f: string) {
    if (f == 'Elementi') {
      return ['10', '20', '50'];
    } else if (f == 'Ordina') {
      return ['Id', 'Utenti iscritti', 'Nome torneo', 'Data creazione', 'Data inizio', 'Data fine', 'Stato'];
    } else if (f == 'Stato') {
      return ["Annunciato", "In corso", "Terminato"];
    } else {
      return [];
    }
  }
  initializeForms() {
    this.filtersForm = new FormGroup({
      pagina: new FormControl(0, Validators.max(this.maxPage || 0)),
      elementi: new FormControl(10, Validators.required),
      ordina: new FormControl('Id', Validators.required),
      nome: new FormControl(''),
      stato: new FormControl(''),
      creazione: new FormControl(''),
      inizio: new FormControl(''),
      fine: new FormControl(''),
      gioco: new FormControl('')
    });
  }

  updateFilters() {
    let controls = this.filtersForm.controls;
    this.page = controls['pagina'].value;
    this.size = controls['elementi'].value;
    this.orderBy = controls['ordina'].value;
    this.nome = controls['nome'].value;
    this.stato = controls['stato'].value;
    this.dataCreazione = controls['creazione'].value;
    this.dataInizio = controls['inizio'].value;
    this.dataFine = controls['fine'].value;
    this.nomeGioco = controls['gioco'].value;
  }

  getTornei() {
    this.administration.getAllTorneiPaged(this.page, this.size, this.orderBy, this.nome, this.stato, this.dataCreazione, this.dataInizio, this.dataFine, this.nomeGioco)
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.tornei = data;
            this.maxPage = this.tornei?.totalPages > 0 ? this.tornei.totalPages - 1 : 0;
            console.log(this.tornei);
          }
        }
      });
  }

  aggiungiTorneo() {
    const dialogRef = this.matDialog.open(AddTournamentComponent);

  }
}
