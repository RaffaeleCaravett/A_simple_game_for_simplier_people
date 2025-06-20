import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../interfaces/interfaces';
import { AuthService } from '../../../services/auth.service';
import { FormGroup } from '@angular/forms';
import { RecensioneService } from '../../../services/recensione.service';

@Component({
  selector: 'app-ask-confirm',
  standalone: true,
  imports: [MatDialogClose, MatDialogActions, MatDialogContent, NgClass, NgIf, NgFor],
  templateUrl: './ask-confirm.component.html',
  styleUrl: './ask-confirm.component.scss'
})
export class AskConfirmComponent implements OnInit {

  giocoName: string = '';
  giocoImage: string = '';
  giocoId: number = 0;
  recensione: any = null;
  validationPoints: number[] = [1, 2, 3, 4, 5];
  user!: User;
  action: string = '';
  recePoints: number = 0;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<AskConfirmComponent>, private authService: AuthService, private recensioneService: RecensioneService) {
    this.user = this.authService.getUser()!;
  }

  ngOnInit(): void {
    this.giocoName = this.data[0].nomeGioco;
    this.giocoImage = this.data[0].image;
    this.giocoId = this.data[0].id;
    this.recensione = this.data[1];
    this.action = this.data[2]
    this.recePoints = this.recensione?.punteggio
  }


  closeDialog(value?: boolean) {
    this.dialogRef.close(value || false);
  }

  modifica() {
    let recensione = {
      punteggio: this.recePoints,
      commento: this.recensione.commento,
      giocoId: this.giocoId
    }
    this.recensioneService.putRecensione(recensione, this.recensione.id).subscribe({
      next: (data: any) => {
        this.dialogRef.close([true, data]);
      }
    })
  }

  elimina() {
    this.dialogRef.close(true);
  }

}
