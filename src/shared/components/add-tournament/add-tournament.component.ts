import { Component, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { NgIf, CommonModule } from "@angular/common";
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { GiochiService } from '../../../services/giochi.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Gioco } from '../../../interfaces/interfaces';

@Component({
  selector: 'app-add-tournament',
  standalone: true,
  imports: [MatDialogModule, FormsModule, ReactiveFormsModule, NgIf, CommonModule, MatTooltipModule, MatProgressSpinnerModule],
  templateUrl: './add-tournament.component.html',
  styleUrl: './add-tournament.component.scss'
})
export class AddTournamentComponent implements OnInit {
  torneoForm: FormGroup = new FormGroup({});
  todayDateDate: Date = new Date();
  todayDateString: string = this.todayDateDate.toISOString().split('T')[0];
  todayDatePlusOneString: string = new Date(this.todayDateDate.setDate(this.todayDateDate.getDate() + 1)).toISOString().split('T')[0];
  stati: string[] = ['ANNUNCIATO', 'IN_CORSO', 'TERMINATO'];
  addGame: boolean = false;
  giochi: any = null;
  isSearchingGames: boolean = false;
  difficulties: number[] = [1, 2, 3, 4, 5];
  selectedGame: Gioco | null = null;
  constructor(private dialogRef: MatDialogRef<AddTournamentComponent>, private toastr: ToastrService, private giochiService: GiochiService) {

  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.torneoForm = new FormGroup({
      nome: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      gioco: new FormControl('', Validators.required),
      dataInizio: new FormControl('', Validators.required),
      dataFine: new FormControl('', Validators.required),
      stato: new FormControl('', Validators.required)
    });
  }
  checkNomeValueLength() {
    return (this.torneoForm.controls['nome'].value as string).replaceAll(' ', '').length > 0;
  }
  checkDataFineValueMayor() {
    let inizio = this.torneoForm.controls['dataInizio'].value;
    let fine = this.torneoForm.controls['dataFine'].value;
    if (inizio && fine) {
      if (inizio > fine) {
        this.torneoForm.controls['dataFine'].setValue('');
        this.torneoForm.controls['dataFine'].updateValueAndValidity();
      }
    }
  }
  checkClick(i: number) {
    document.getElementById(`check-${i}`)?.click();
  }
  searchGame(giocoName: string) {
    this.isSearchingGames = true;
    this.giochiService.searchGiochi({ nome: giocoName }, 0, 100, 'id', 'ASC').subscribe({
      next: (giochi: any) => {
        this.giochi = giochi;
        setTimeout(() => {
          this.isSearchingGames = false;
        }, 1500);
      }
    });
    setTimeout(() => {
      if (this.giochi == null) {
        this.toastr.show("Refresha la pagina, il token è scaduto!");
      }
    }, 5000);
  }
  addClass(state: string) {
    console.log(state)
    switch (state) {
      case ('ANNUNCIATO'): {
        return 'box-info';
      }
      case ('IN_CORSO'): {
        return 'box-success';
      }
      default: {
        return 'box-danger';
      }
    }
  }
  chooseGame(game: Gioco) {
    this.addGame = false;
    this.selectedGame = game;
  }
}
