import { Component, OnInit } from '@angular/core';
import { AdministrationService } from '../../../../services/administration.service';
import { AuthService } from '../../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Categoria, User } from '../../../../interfaces/interfaces';
import { NgFor, NgIf } from "@angular/common";
import { MatDialog } from '@angular/material/dialog';
import { AskConfirmComponent } from '../../../../shared/components/ask-confirm/ask-confirm.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
  selector: 'app-ad-categorie',
  standalone: true,
  imports: [NgFor, MatTooltipModule, ReactiveFormsModule, MatProgressSpinnerModule, NgIf, FormsModule],
  templateUrl: './ad-categorie.component.html',
  styleUrl: './ad-categorie.component.scss'
})
export class AdCategorieComponent implements OnInit {
  user: User | null = null;
  categorie: Categoria[] = [];
  showSpinner: boolean = false;
  addCategory: boolean = false;
  addCategoriaForm: FormGroup = new FormGroup({});
  constructor(private administrationService: AdministrationService, private authService: AuthService, private toastr: ToastrService,
    private matDialog: MatDialog) { }
  ngOnInit(): void {
    localStorage.setItem('location', 'amministrazione/categorie');
    localStorage.setItem('action', 'categorie');
    this.user = this.authService.getUser();
    this.getCategorie();
    this.addCategoriaForm = new FormGroup({
      nome: new FormControl('', Validators.required)
    });
  }
  getCategorie() {
    this.addCategory = false;
    this.showSpinner = true;
    this.administrationService.getAllCategories().subscribe({
      next: (data: any) => {
        setTimeout(() => {
          this.categorie = data;
          this.showSpinner = false;
        }, 1500);
      }
    });
  }

  handleEvent(event: string, categoria: Categoria) {
    const dialogRef = this.matDialog.open(AskConfirmComponent, { data: [null, null, event, categoria] });
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.toastr.success(data);
        this.getCategorie();
      } else {
        this.toastr.show("Non è stata effettuata nessuna azione");
      }
    })
  }

  firstLetterToUpperCase(element: string) {
    if (element?.length == 0) return "";
    return element.substring(0, 1).toUpperCase() + element.substring(1, element.length);
  }
  addCategoria() {
    if (this.addCategoriaForm.valid) {
      this.administrationService.addCategoria({ nome: this.addCategoriaForm?.controls['nome']?.value }).subscribe({
        next: (data: any) => {
          this.addCategoriaForm.reset();
          this.toastr.success("Categoria aggiunta con successo.");
        }
      })
    } else {
      this.toastr.error("Aggiungi un nome");
    }
  }
}
