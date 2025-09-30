import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from "@angular/common";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
  selector: 'app-ad-tornei',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule],
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
  dataCreazione: string = '';
  dataInizio: string = '';
  dataFine: string = '';
  nomeGioco: string = '';
  filters: string[] = ["Pagina", "Elementi", "Ordina", "Nome", "Creazione", "Inizio", "Fine", "Gioco"];
  maxPage: number | null = null;
  filtersForm: FormGroup = new FormGroup({});
  ngOnInit(): void {
    localStorage.setItem('action', 'tornei');
    localStorage.setItem('location', 'amministrazione/tornei');
    this.initializeForms();
  }

  giveBackArray(f: string) {
    if (f == 'Elementi') {
      return ['10', '20', '50'];
    } else if (f == 'Ordina per') {
      return ['Id', 'Utenti iscritti', 'Nome torneo', 'Data creazione', 'Data inizio', 'Data fine']
    } else {
      return []
    }
  }
  initializeForms() {
    this.filtersForm = new FormGroup({
      pagina: new FormControl(0, Validators.max(this.maxPage || 0)),
      elementi: new FormControl(10, Validators.required),
      ordina: new FormControl('Id', Validators.required),
      nome: new FormControl(''),
      creazione: new FormControl(''),
      inizio: new FormControl(''),
      fine: new FormControl(''),
      gioco: new FormControl('')
    })
  }
}
