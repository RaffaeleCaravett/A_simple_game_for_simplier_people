import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from "@angular/common";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { AdministrationService } from '../../../../services/administration.service';
import { ToastrService } from 'ngx-toastr';
import { MatTooltip } from "@angular/material/tooltip";
import { MatDialog } from '@angular/material/dialog';
import { AddTournamentComponent } from '../../../../shared/components/add-tournament/add-tournament.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AskConfirmComponent } from '../../../../shared/components/ask-confirm/ask-confirm.component';

@Component({
  selector: 'app-ad-tornei',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule, MatTooltip, MatProgressSpinnerModule, NgClass],
  templateUrl: './ad-tornei.component.html',
  styleUrl: './ad-tornei.component.scss'
})
export class AdTorneiComponent implements OnInit {

  selectedTorneo: any = null;
  tornei: any = null;
  page: number = 1;
  size: number = 5;
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
  showTorneiSpinner: boolean = false;

  constructor(private administration: AdministrationService, private toastr: ToastrService, private matDialog: MatDialog) { }

  ngOnInit(): void {
    localStorage.setItem('action', 'tornei');
    localStorage.setItem('location', 'amministrazione/tornei');
    this.initializeForms();
    this.getTornei();
  }

  giveBackArray(f: string) {
    if (f == 'Elementi') {
      return ['5', '20', '50'];
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
      pagina: new FormControl(1, Validators.max(this.maxPage || 0)),
      elementi: new FormControl(5, Validators.required),
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
    this.showTorneiSpinner = true;
    this.administration.getAllTorneiPaged(this.page - 1, this.size, this.orderBy, this.nome, this.stato, this.dataCreazione, this.dataInizio, this.dataFine, this.nomeGioco)
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.tornei = data;
            this.maxPage = this.tornei?.totalPages > 0 ? this.tornei.totalPages - 1 : 0;
            setTimeout(() => {
              this.showTorneiSpinner = false;
            }, 1500);
          }
        }
      });
  }

  checkValue(value: string) {
    let numb = Number(value);
    if (numb < 1) {
      this.filtersForm.controls['pagina'].setValue(1);
    }
    else {
      this.filtersForm.controls['pagina'].setValue(numb > this.tornei?.totalPages ? this.tornei.totalPages : numb);
    }
    this.filtersForm.controls['pagina'].updateValueAndValidity();
  }
  aggiungiTorneo() {
    const dialogRef = this.matDialog.open(AddTournamentComponent);
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.toastr.success("Torneo aggiunto");
        this.getTornei();
      } else {
        this.toastr.show("Non è stata effettuata alcuna azione");
      }
    });
  }
  openDialog(action: string, torneo: any) {
    const dialogRef = this.matDialog.open(AskConfirmComponent, { data: [null, null, action, null, torneo] });
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.toastr.success(data);
        this.getTornei();
      } else {
        this.toastr.show("Non è stata effettuata nessuna azione");
      }
    })
  }
  handlePageEvent(event: string) {
    if (event == 'plus') {
      this.page = this.page + 1;
    } else {
      this.page = this.page - 1;
    }
    this.getTornei();

  }
}
