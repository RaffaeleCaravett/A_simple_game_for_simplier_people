import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../interfaces/interfaces';
import { NgClass, NgFor } from '@angular/common';

@Component({
  selector: 'app-gioco-preview',
  standalone: true,
  imports: [MatDialogActions, MatDialogContent, MatDialogTitle, MatDialogClose, NgClass, NgFor
  ],
  templateUrl: './gioco-preview.component.html',
  styleUrl: './gioco-preview.component.scss'
})
export class GiocoPreviewComponent implements OnInit {
  user: User | null = null;
  gioco: any;
  circles: number[] = [1, 2, 3, 4, 5]
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private authService: AuthService, private matDialogRef : MatDialogRef<GiocoPreviewComponent>) {
    this.gioco = data;
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
  }

  play() {
    this.close(true);
  }
  close(value:boolean){
    this.matDialogRef.close(value);
  }
}
