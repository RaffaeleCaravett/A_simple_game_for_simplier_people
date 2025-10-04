import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { Categoria, User } from '../../../interfaces/interfaces';
import { AuthService } from '../../../services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { RecensioneService } from '../../../services/recensione.service';
import { MatTooltip, MatTooltipModule } from "@angular/material/tooltip";
import { AdministrationService } from '../../../services/administration.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ask-confirm',
  standalone: true,
  imports: [MatDialogClose, MatDialogActions, MatDialogContent, MatTooltipModule,
    NgClass, NgIf, NgFor, ɵInternalFormsSharedModule, ReactiveFormsModule, MatTooltip],
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
  categoria: Categoria | null = null;
  categoriaForm: FormGroup = new FormGroup({});
  torneo: any = null;
  torneoForm: FormGroup = new FormGroup({});
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<AskConfirmComponent>, private authService: AuthService,
    private recensioneService: RecensioneService, private administrationService: AdministrationService, private toastr: ToastrService) {
    this.user = this.authService.getUser()!;
  }

  ngOnInit(): void {
    this.giocoName = this.data[0]?.nomeGioco;
    this.giocoImage = this.data[0]?.image;
    this.giocoId = this.data[0]?.id;
    this.recensione = this.data[1];
    this.action = this.data[2]
    this.recePoints = this.recensione?.punteggio
    this.categoria = this.data[3];
    this.torneo = this.data[4];
    if (this.categoria && this.categoria != undefined) {
      this.categoriaForm = new FormGroup({
        categoria: new FormControl(this.categoria.nome, Validators.required)
      });
    } else if (this.torneo && this.torneo != undefined) {
      this.torneoForm = new FormGroup({
        torneo: new FormControl(this.torneo?.name, Validators.required)
      });
    }
  }


  closeDialog(value?: boolean) {
    this.dialogRef.close(value || false);
  }

  modifica() {
    if (this.recensione != null) {
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
    } else if (this.categoria != null) {
      if (this.categoriaForm.valid && this.categoriaForm.get('categoria')?.value != this.categoria.nome && this.action == 'Modifica') {
        this.administrationService.modifyCategoria(this.categoria.id, this.categoriaForm.controls['categoria'].value).subscribe({
          next: (data: any) => {
            this.dialogRef.close("Categoria modificata con successo.");
          }
        });
      } else if (this.action == 'Elimina') {
        this.administrationService.deleteCategoria(this.categoria.id).subscribe({
          next: (data: any) => {
            this.dialogRef.close("Categoria eliminata con successo.");
          }
        });
      } else {
        if (this.categoriaForm.get('categoria')?.value == this.categoria.nome) {
          this.toastr.error("Modifica il nome prima.");
        } else {
          this.toastr.error("Inserisci il nome prima.");
        }
      }
    } else if (this.torneo != null) {
      if (this.action == 'Elimina') {
        this.administrationService.deleteTorneo(this.torneo.id).subscribe({
          next: (data: any) => {
            this.dialogRef.close("Torneo eliminato con successo");
          }
        })
      } else if (this.action == 'Modifica') {
        if (this.torneoForm.valid) {
          this.administrationService.putTorneo(this.torneo.id,this.torneoForm.controls['torneo'].value,  {})
            .subscribe({
              next: (data: any) => {
                this.dialogRef.close("Torneo modificato con successo");
              }
            });
        } else {
          this.toastr.error("Inserisci un nome!");
        }
      }
    } else {
      this.dialogRef.close(true);
    }
  }
  getLowerAction(action: string) {
    return action.toLowerCase();
  }

  elimina() {
    this.dialogRef.close(true);
  }

}
