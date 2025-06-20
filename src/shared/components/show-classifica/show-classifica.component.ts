import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClassificheService } from '../../../services/classifiche.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-show-classifica',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, NgFor],
  templateUrl: './show-classifica.component.html',
  styleUrl: './show-classifica.component.scss'
})
export class ShowClassificaComponent implements OnInit{

  classifica: any = null;
  gioco:any = null;
  users:any[] = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private classificheService: ClassificheService, private matDialogRef : MatDialogRef<ShowClassificaComponent>) {} 

  ngOnInit(): void {
    this.classifica = this.data;
    this.gioco = this.classifica?.gioco
    this.classificheService.getByGiocoId(this.classifica?.gioco?.id).subscribe({
      next:(data:any)=>{
        this.users = Object.values(data?.users)
      }
    })
  }
  close(){
    this.matDialogRef.close();
  }

}
