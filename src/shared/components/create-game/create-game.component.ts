import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from "@angular/material/dialog";
import { Categoria } from '../../../interfaces/interfaces';
import { ToastrService } from 'ngx-toastr';
import { GiochiService } from '../../../services/giochi.service';
import { Slider } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';
import { MatTooltip } from "@angular/material/tooltip";
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { AdministrationService } from '../../../services/administration.service';
@Component({
  selector: 'app-create-game',
  standalone: true,
  imports: [MatDialogActions, MatDialogTitle, MatDialogContent, ReactiveFormsModule, NgIf, NgFor, NgClass, FormsModule,
    Slider, InputTextModule, MatTooltip, AutoComplete],
  templateUrl: './create-game.component.html',
  styleUrl: './create-game.component.scss'
})
export class CreateGameComponent implements OnInit {

  aggiungiGiocoForm: FormGroup = new FormGroup({});
  selectedImage: File | null = null;
  imageUrl: string = '';
  categorie: Categoria[] = [];
  categorieNames: string[] = [];
  choosedCategories: Categoria[] = [];
  value: number = 0;
  stars: number[] = [1, 2, 3, 4, 5];
  difficoltaTouched: boolean = false;
  step: number = 1;
  valueCategory: string = "";
  constructor(private dialogRef: MatDialogRef<CreateGameComponent>, private toastr: ToastrService, private giochiService: GiochiService,
    private administrationService: AdministrationService) { }
  number(arg0: string) {
    return Number(arg0);
  }
  ngOnInit(): void {
    this.initializeForms();
  }

  initializeForms() {
    this.aggiungiGiocoForm = new FormGroup({
      nomeGioco: new FormControl('', Validators.required),
      descrizione: new FormControl('', [Validators.required, Validators.maxLength(120)])
    });
  }
  handleImageEvent(event: any) {
    this.selectedImage = event.target.files[0];
    let reader = new FileReader();

    reader.readAsDataURL(event.target.files[0]);

    reader.onload = (eventR: any) => {
      this.imageUrl = eventR.target.result;
    };
  }
  cleanImage() {
    this.imageUrl = "";
    this.selectedImage = null;
  }


  searchCategories(event: AutoCompleteCompleteEvent) {
    this.administrationService.getCategoriaByNameContaining(event.query).subscribe({
      next: (data: any) => {
        this.categorie = data;
        this.categorieNames = (data as Categoria[]).slice(0, data?.length > 5 ? 5 : data.length).map(c => c.nome);
      }
    });
  }
}
