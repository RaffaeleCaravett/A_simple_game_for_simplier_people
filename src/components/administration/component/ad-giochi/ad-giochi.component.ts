import { NgClass, NgFor, NgIf } from '@angular/common';
import { AfterContentChecked, ChangeDetectorRef, Component, HostListener, Input, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { AdministrationService } from '../../../../services/administration.service';
import { GiochiService } from '../../../../services/giochi.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Categoria, Gioco, User } from '../../../../interfaces/interfaces';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { AskConfirmComponent } from '../../../../shared/components/ask-confirm/ask-confirm.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RecensioniComponent } from '../../../../shared/components/recensioni/recensioni.component';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';


@Component({
  selector: 'app-ad-giochi',
  standalone: true,
  imports: [NgIf, MatMenuModule, NgFor, ReactiveFormsModule, NgClass, MatSlideToggleModule, FormsModule],
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
  actions: { class: string, action: string }[] = [{ class: "bi bi-eye", action: 'view' }, { class: "bi bi-pencil", action: 'edit' }, { class: "bi bi-trash", action: 'delete' }
    , { class: "bi bi-arrow-clockwise", action: 'restore' }];
  showModal: boolean = false;
  choosedAction: string = '';
  choosedGame: Gioco | null = null;
  editGameForm: FormGroup = new FormGroup({});
  editedChoosedGameName: string = '';
  editedChoosedGameDescription: string = '';
  editedChoosedGameDifficult: string = '';
  selectedImage: File | null = null;
  choosedImageUrl: string = '';
  isChecked: boolean = true;
  availableChoosedGameCategories: Categoria[] = [];
  user!: User | null;

  constructor(private administrationService: AdministrationService, private giochiService: GiochiService,
    private changeDet: ChangeDetectorRef, private toastr: ToastrService, private matDialog: MatDialog,
     private activatedRoute: ActivatedRoute, private authService: AuthService) { }

  ngAfterContentChecked(): void {
    this.changeDet.detectChanges();
    this.changeDet.markForCheck();
  }
  ngOnInit(): void {
    if (this.activatedRoute?.snapshot?.queryParams['user']) {
      this.user = JSON.parse(this.activatedRoute.snapshot.queryParams['user']);
    } else {
      this.user = this.authService.getUser();
    }
    
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
    this.giochiService.searchGiochi(body, this.page, this.size, this.orderBy, this.sortOrder, this.isChecked).subscribe({
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
    this.choosedGame = gioco;
    this.categorie.forEach((cat: Categoria) => {
      let contains: boolean = false;
      this.choosedGame?.categorie.forEach(c => {
        if (c.id == cat.id) {
          contains = true;
        }
      });
      if (!contains) {
        this.availableChoosedGameCategories.push(cat);
      }
    });
    if (action == 'delete' || action == 'restore') {
      let dialog = this.matDialog.open(AskConfirmComponent, { data: [this.choosedGame, null, action == 'delete' ? 'Elimina' : 'Recupera'], width: '60%', height: '70%' });
      dialog.afterClosed().subscribe((data: boolean) => {
        if (data) {
          if (action == 'delete') {
            this.administrationService.deleteGame(this.choosedGame!.id).subscribe({
              next: (value: any) => {
                if (value) {
                  this.toastr.success("Gioco eliminato con successo");
                  this.searchGiochi();
                } else {
                  this.toastr.error("E' successo qualcosa che ha impedito l'eliminazione del gioco.");
                }
              }
            })
          } else {
            this.administrationService.restoreGame(this.choosedGame!.id).subscribe({
              next: (value: any) => {
                if (value) {
                  this.toastr.success("Gioco recuperato con successo");
                  this.searchGiochi();
                } else {
                  this.toastr.error("E' successo qualcosa che ha impedito il recuper del gioco.");
                }
              }
            })
          }
        } else {
          this.toastr.warning(`Non è stato ${action == 'delete' ? 'eliminato' : 'recuperato'} nessun gioco.`);
        }
      })
    } else {
      this.showModal = true;
      this.choosedAction = action;
    }
  }
  closeModal() {
    this.showModal = false;
    this.choosedAction = '';
    this.choosedGame = null;
  }
  modifyGame(game: Gioco) {
    if (this.selectedImage != null || this.editGameForm.controls['nome'].value != ''
      || (this.editGameForm.controls['difficolta'].value != '' && this.editGameForm.controls['difficolta'].value != undefined) || this.editGameForm.controls['descrizione'].value != ''
    ) {
      let dialog = this.matDialog.open(AskConfirmComponent, { data: [this.choosedGame, null, 'Modifica'], width: '60%', height: '70%' })
      let modify: boolean = false;
      dialog.afterClosed().subscribe((result: boolean) => {
        if (result) {
          modify = true;
        }
        if (modify) {
          let gioco = {
            nome: this.editGameForm.controls['nome'].value,
            descrizione: this.editGameForm.controls['descrizione'].value,
            difficolta: this.editGameForm.controls['difficolta'].value,
            categorie: this.choosedGame?.categorie.map(c => c.id)
          };
          this.administrationService.putGameById(game.id, gioco, this.selectedImage).subscribe({
            next: (value: any) => {
              this.toastr.success("Modifiche apportate correttamente.")
              this.choosedGame = value;
              this.searchGiochi();
            }
          });
        } else {
          this.toastr.warning("Nessun gioco è stato modificato.");
        }
      })
    } else {
      this.toastr.warning("Modifica qualcosa prima.");
    }
  }

  handleImageEvent(event: any) {
    this.selectedImage = event.target.files[0];
    let reader = new FileReader();

    reader.readAsDataURL(event.target.files[0]);

    reader.onload = (eventR: any) => {
      this.choosedImageUrl = eventR.target.result;
    };
  }
  cleanImage() {
    (document.getElementById('uploadedImage')! as HTMLImageElement).src = "";
    this.selectedImage = null;
  }

  onAddCategory(categoriaId: string, select: HTMLSelectElement) {
    let categoria: Categoria = this.availableChoosedGameCategories.filter(c => c.id == Number(categoriaId))[0];
    if (this.choosedGame!.categorie.length < 3) {
      this.choosedGame?.categorie.push(categoria);
      this.availableChoosedGameCategories = this.availableChoosedGameCategories.filter(c => c.id != categoria.id);
      let gioco = {
        categorie: this.choosedGame?.categorie.map(c => c.id)
      }
      this.administrationService.putGameById(this.choosedGame!.id, gioco).subscribe({
        next: (value: any) => {
          this.choosedGame = value;
          this.toastr.success("Categoria aggiornate correttamente");
          this.searchGiochi();
        }
      });
    } else {
      this.toastr.warning("Attenzione, " + this.choosedGame?.nomeGioco + " ha già tre categorie associate.");
      select.value = "";
    }
  }
  onRemoveCategory(categoria: Categoria) {
    this.choosedGame!.categorie = this.choosedGame!.categorie.filter(c => c.id != categoria.id);
    this.availableChoosedGameCategories.push(categoria);

    this.administrationService.deleteCategoryFromGameById(this.choosedGame!.id, categoria.id).subscribe({
      next: (value: any) => {
        this.choosedGame = value;
        this.toastr.success("Categorie aggiornate correttamente");
        this.searchGiochi();
      }
    });
  }

  seeValidations(game: Gioco) {
    const dialogRef = this.matDialog.open(RecensioniComponent, { data: game, width: '90%', height: '90%' });
    dialogRef.afterClosed().subscribe((gioco: Gioco) => {
      if (gioco) {
        this.choosedGame = gioco;
        this.searchGiochi();
      }
    })
  }
}
