import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from "@angular/material/dialog";
import { Categoria } from '../../../interfaces/interfaces';
import { ToastrService } from 'ngx-toastr';
import { GiochiService } from '../../../services/giochi.service';

@Component({
  selector: 'app-create-game',
  standalone: true,
  imports: [MatDialogActions, MatDialogTitle, MatDialogContent, ReactiveFormsModule, NgIf, NgFor, NgClass],
  templateUrl: './create-game.component.html',
  styleUrl: './create-game.component.scss'
})
export class CreateGameComponent implements OnInit {
  aggiungiGiocoForm: FormGroup = new FormGroup({});
  selectedImage: File | null = null;
  imageUrl: string = '';
  categorie: Categoria[] = [];
  choosedCategories: Categoria[] = [];
  constructor(private dialogRef: MatDialogRef<CreateGameComponent>, private toastr: ToastrService, private giochiService: GiochiService
  ) { }

  ngOnInit(): void {
    this.initializeForms();
  }

  initializeForms() {
    this.aggiungiGiocoForm = new FormGroup({
      nomeGioco: new FormControl('', Validators.required),
      difficolta: new FormControl('', [Validators.required, Validators.min(1), Validators.max(5)]),
      descrizione: new FormControl('', Validators.required)
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

}
