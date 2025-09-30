import { Component, OnInit } from '@angular/core';
import { AdministrationService } from '../../../../services/administration.service';
import { AuthService } from '../../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Categoria, User } from '../../../../interfaces/interfaces';
import { NgFor } from "@angular/common";
import { MatDialog } from '@angular/material/dialog';
import { AskConfirmComponent } from '../../../../shared/components/ask-confirm/ask-confirm.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-ad-categorie',
  standalone: true,
  imports: [NgFor, MatTooltipModule],
  templateUrl: './ad-categorie.component.html',
  styleUrl: './ad-categorie.component.scss'
})
export class AdCategorieComponent implements OnInit {
  user: User | null = null;
  categorie: Categoria[] = [];
  constructor(private administrationService: AdministrationService, private authService: AuthService, private toastr: ToastrService,
    private matDialog: MatDialog) { }
  ngOnInit(): void {
    localStorage.setItem('location', 'amministrazione/categorie');
    this.user = this.authService.getUser();
    this.getCategorie();
  }
  getCategorie() {
    this.administrationService.getAllCategories().subscribe({
      next: (data: any) => {
        this.categorie = data;
      }
    });
  }

  handleEvent(event: string, categoria: Categoria) {
    const dialogRef = this.matDialog.open(AskConfirmComponent, { data: [null, null, event, categoria] });
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.toastr.success(data);
      } else {
        this.toastr.show("Non è stata effettuata nessuna azione");
      }
    })
  }

  firstLetterToUpperCase(element: string) {
    if (element?.length == 0) return "";
    return element.substring(0, 1).toUpperCase() + element.substring(1, element.length);
  }
}
