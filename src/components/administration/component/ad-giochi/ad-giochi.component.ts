import { NgClass, NgFor, NgIf } from '@angular/common';
import { AfterContentChecked, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { AdministrationService } from '../../../../services/administration.service';
import { GiochiService } from '../../../../services/giochi.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Categoria, Gioco } from '../../../../interfaces/interfaces';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ad-giochi',
  standalone: true,
  imports: [NgIf, MatMenuModule, NgFor, ReactiveFormsModule, NgClass],
  templateUrl: './ad-giochi.component.html',
  styleUrl: './ad-giochi.component.scss'
})
export class AdGiochiComponent implements OnInit, AfterContentChecked {
  innerWidth: number = 0;
  items: string[] = ["Visualizza", "Modifica", "Elimina"];
  action: string = "";
  filterForms: FormGroup = new FormGroup({});
  page: number = 0;
  size: number = 5;
  orderBy: string = 'id';
  sortOrder: string = 'ASC';
  giochi: any = null;
  giochiArray: Gioco[] = [];
  orders: { value: string, label: string }[] = [{ value: "id", label: "id" }, { value: "difficolta", label: "difficolta" }, { value: "createdAt", label: "Data creazione" }];
  sorts: { value: string, label: string }[] = [{ value: "ASC", label: "Crescente" }, { value: "DESC", label: "Decrescente" }];
  sizes: { value: string, label: string }[] = [{ value: "1", label: "Uno (1)" }, { value: "5", label: "Cinque (5)" },
  { value: "10", label: "Dieci (10)" }, { value: "20", label: "Venti (20)" }];
  pages: number[] = [1];
  categorie: Categoria[] = [];
  choosedCategories: Categoria[] = [];
  actions: { class: string, action: string }[] = [{ class: "bi bi-eye", action: 'view' }, { class: "bi bi-pencil", action: 'edit' }, { class: "bi bi-trash", action: 'delete' }];
  showModal: boolean = false;
  choosedAction: string = '';
  choosedGame: Gioco | null = null;
  editGameForm: FormGroup = new FormGroup({});
  editedChoosedGameName: string = '';
  editedChoosedGameDescription: string = '';
  editedChoosedGameDifficult: string = '';
  constructor(private administrationService: AdministrationService, private giochiService: GiochiService,
    private changeDet: ChangeDetectorRef, private toastr: ToastrService) { }

  ngAfterContentChecked(): void {
    this.changeDet.detectChanges();
    this.changeDet.markForCheck();
  }
  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.getAllCategorie();
    this.initializeForms();
  }

  handleEditedGame() {
    this.editedChoosedGameName = this.editGameForm.controls['nome'].value;
    if ((this.editGameForm.controls['difficolta'].value > 0 && this.editGameForm.controls['difficolta'].value < 6) ||
      this.editGameForm.controls['difficolta'].value == undefined || this.editGameForm.controls['difficolta'].value == null) {
      this.editedChoosedGameDifficult = this.editGameForm.controls['difficolta'].value;
    } else {
      this.toastr.error("La difficoltà deve essere un numero compreso fra 1 e 5");
      this.editGameForm.controls['difficolta'].setValue(null);
    }
    if (this.editGameForm.controls['descrizione'].value.length < 5000) {
      this.editedChoosedGameDescription = this.editGameForm.controls['descrizione'].value;
    } else {
      this.toastr.error("La descrizione non può superare i 5000 caratteri.");
      this.editGameForm.controls['descrizione'].setValue(this.editGameForm.controls['descrizione'].value.substring(0, 5000));
    }
    if (this.editedChoosedGameName == '') this.editedChoosedGameName == null;
    if (this.editedChoosedGameDescription == '') this.editedChoosedGameDescription == null;
    if (this.editedChoosedGameDifficult == '') this.editedChoosedGameDifficult == null;
    this.changeDet.detectChanges();
    this.changeDet.markForCheck();
    this.editGameForm.updateValueAndValidity();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerWidth = window.innerWidth;
  }
  toNumber(value: any): number {
    return Number(value);
  }

  initializeForms() {
    this.filterForms = new FormGroup({
      nome: new FormControl(''),
      difficolta: new FormControl(''),
      punteggio: new FormControl(''),
      categoria: new FormControl(''),
      orderBy: new FormControl('id'),
      sortOrder: new FormControl('ASC'),
      items: new FormControl(5),
      page: new FormControl(0)
    });
    this.editGameForm = new FormGroup({
      nome: new FormControl(''),
      difficolta: new FormControl(undefined, [Validators.min(1), Validators.max(2)]),
      descrizione: new FormControl('')
    });
  }
  getAllCategorie() {
    this.administrationService.getAllCategories().subscribe({
      next: (value: any) => {
        this.categorie = value;
      }
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
        this.giochiArray = this.giochi?.content;
        this.pages = [];
        for (let p = 1; p <= this.giochi?.totalPages; p++) {
          this.pages.push(p);
        }
      }
    })
  }
  updateChoosedCategories(id: string) {
    let numberId = Number(id);
    if (this.choosedCategories.length == 0) {
      this.categorie.forEach(c => {
        if (c.id == numberId) {
          this.choosedCategories.push(c);
        }
      });
    } else if (this.choosedCategories.map(c => c.id).includes(numberId)) {
      this.choosedCategories = this.choosedCategories.filter(c => c.id != numberId);
    } else {
      this.categorie.forEach(c => {
        if (c.id == numberId) {
          this.choosedCategories.push(c);
        }
      });
    }
  }
  manageGame(action: string, gioco: any) {
    this.showModal = true;
    this.choosedAction = action;
    this.choosedGame = gioco;
  }
  closeModal() {
    this.showModal = false;
    this.choosedAction = '';
    this.choosedGame = null;
  }
}
