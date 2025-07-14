import { NgFor, NgIf } from '@angular/common';
import { AfterContentChecked, AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { AdministrationService } from '../../../../services/administration.service';
import { GiochiService } from '../../../../services/giochi.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-ad-giochi',
  standalone: true,
  imports: [NgIf, MatMenuModule, NgFor, ReactiveFormsModule],
  templateUrl: './ad-giochi.component.html',
  styleUrl: './ad-giochi.component.scss'
})
export class AdGiochiComponent implements OnInit, AfterContentChecked {
  innerWidth: number = 0;
  items: string[] = ["Visualizza", "Modifica", "Elimina"];
  action: string = "";
  filterForms: FormGroup = new FormGroup({});
  page: number = 0;
  size: number = 1;
  orderBy: string = 'id';
  sortOrder: string = 'ASC';
  giochi: any = null;
  orders: { value: string, label: string }[] = [{ value: "id", label: "id" }, { value: "difficolta", label: "difficolta" }, { value: "createdAt", label: "Data creazione" }];
  sorts: { value: string, label: string }[] = [{ value: "ASC", label: "Crescente" }, { value: "DESC", label: "Decrescente" }];
  sizes: { value: string, label: string }[] = [{ value: "1", label: "Uno (1)" }, { value: "5", label: "Cinque (5)" },
  { value: "10", label: "Dieci (10)" }, { value: "20", label: "Venti (20)" }];
  pages: number[] = [1];
  constructor(private administrationService: AdministrationService, private giochiService: GiochiService, private changeDet: ChangeDetectorRef) { }

  ngAfterContentChecked(): void {
    this.changeDet.detectChanges();
    this.changeDet.markForCheck();
  }
  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.initializeForms();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerWidth = window.innerWidth;
  }


  initializeForms() {
    this.filterForms = new FormGroup({
      nome: new FormControl(''),
      difficolta: new FormControl(''),
      punteggio: new FormControl(''),
      categoria: new FormControl(''),
      orderBy: new FormControl(''),
      sortOrder: new FormControl(''),
      items:new FormControl(''),
      page:new FormControl('')
    })
  }

  searchGiochi() {
    let body = {
      nome: this.filterForms.get('nome')?.value,
      punteggio: this.filterForms.get('punteggio')?.value,
      difficolta: this.filterForms.get('difficolta')?.value,
      categoria: this.filterForms.get('categoria')?.value,
    }
    this.giochiService.searchGiochi(body, this.page, this.size, this.orderBy, this.sortOrder).subscribe({
      next: (value: any) => {
        this.giochi = value;
        this.pages = [];
        for (let p = 1; p <= this.giochi?.totalPages; p++) {
          this.pages.push(p);
        }
      }
    })
  }
}
