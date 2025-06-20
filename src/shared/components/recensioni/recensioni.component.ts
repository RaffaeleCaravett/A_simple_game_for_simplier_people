import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { User } from '../../../interfaces/interfaces';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { RecensioneService } from '../../../services/recensione.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AskConfirmComponent } from '../ask-confirm/ask-confirm.component';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recensioni',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatMenuModule, NgClass, NgFor, MatDialogClose, NgIf, ReactiveFormsModule],
  templateUrl: './recensioni.component.html',
  styleUrl: './recensioni.component.scss'
})
export class RecensioniComponent implements OnInit {
  user: User | null = null;
  gioco: any = null;
  recensione: any = null;
  validationPoints: number[] = [1, 2, 3, 4, 5];
  recensioni: any;
  recensioneForm: FormGroup = new FormGroup({});
  isRecensioneFormSubmitted: boolean = false;
  page: number = 0;
  size: number = 2;
  orderBy: string = 'punteggio';
  sortOrder: string = 'ASC';
  ordinaArray: { label: string, values: string[] }[] = [
    { label: 'Punteggio migliore', values: ['punteggio', 'DESC'] },
    { label: 'Punteggio peggiore', values: ['punteggio', 'ASC'] },
    { label: 'Più recente', values: ['createdAt', 'DESC'] },
    { label: 'Meno recente', values: ['createdAt', 'ASC'] }];
  sizes: number[] = [2, 5, 10];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private authService: AuthService, private recensioneService: RecensioneService, private toastr: ToastrService,
    private dialog: MatDialog, private router: Router, private dialogRef: MatDialogRef<RecensioniComponent>) {
    this.gioco = data;
    this.user = this.authService.getUser();
  }
  ngOnInit(): void {
    this.getRecensioni(false, this.page, this.size, this.orderBy, this.sortOrder);
    this.generateRecensioneForm();
  }

  getRecensioni(not?: boolean, page?: number, size?: number, orderBy?: string, sortOrder?: string) {
    if (!not) this.recensioneService.getRecensioneByUserIdAndGiocoId(this.gioco?.id).subscribe((data: any) => { this.recensione = data; });
    this.recensioneService.getRecensioneByGiocoIdPaginated(this.gioco?.id, page, size, orderBy, sortOrder).subscribe((data: any) => { this.recensioni = data; });
  }

  generateRecensioneForm() {
    this.recensioneForm = new FormGroup({
      punteggio: new FormControl('', Validators.required),
      commento: new FormControl('', Validators.required)
    })
  }

  recensisciGioco() {
    this.isRecensioneFormSubmitted = true;
    if (this.recensioneForm.valid) {
      let recensione = {
        giocoId: this.gioco?.id,
        commento: this.recensioneForm.get('commento')?.value,
        punteggio: this.recensioneForm.get('punteggio')?.value
      }

      const dialogRef = this.dialog.open(AskConfirmComponent, { data: [this.gioco, recensione, 'Salva'], width: '60%', height: '70%' })

      dialogRef.afterClosed().subscribe((data: boolean) => {
        if (data) {
          this.recensioneService.saveRecensione(recensione).subscribe({
            next: () => {
              this.getRecensioni();
              this.recensioneService.alertRece(true);
            }
          })
        } else {
          this.toastr.show("Non è stata aggiunta nessuna recensione.")
        }
      })
    } else {
      this.toastr.error("Completa correttamente il form.")
    }
  }

  checkCommento() {
    return (this.recensioneForm.get('commento')!.invalid || this.recensioneForm.get('commento')!.value.trim() === "")
  }

  toNumber(value: string) {
    return Number(value);
  }

  updateRece(recensione: any) {
    const dialogRef = this.dialog.open(AskConfirmComponent, { data: [this.gioco, recensione, 'Modifica'], width: '60%', height: '70%' })

    dialogRef.afterClosed().subscribe((data: any[]) => {
      if (data && data[0] == true) {
        this.recensione = data[1];
        this.toastr.success("Recensione modificata con successo.")
        this.recensioneService.alertRece(true);
      } else {
        this.toastr.show("Non è stata modificata nessuna recensione.")
      }
    })
  }

  deleteRece(recensione: any) {
    const dialogRef = this.dialog.open(AskConfirmComponent, { data: [this.gioco, recensione, 'Elimina'], width: '60%', height: '70%' })

    dialogRef.afterClosed().subscribe((data: boolean) => {
      if (data) {
        this.recensioneService.deleteRecensione(recensione?.id).subscribe({
          next: () => {
            this.toastr.success("Recensione eliminata con successo.")
            this.recensione = null;
            this.recensioneService.alertRece(true);
          }
        })
      } else {
        this.toastr.show("Non è stata eliminata nessuna recensione.")
      }
    })
  }

  goToProfile(user: User) {
    this.router.navigate(['/lobby/profile'], { queryParams: { user: JSON.stringify(user) } });
    this.dialogRef.close();
  }
}
