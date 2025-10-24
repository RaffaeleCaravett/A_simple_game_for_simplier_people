import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-show-scopa-points',
  standalone: true,
  imports: [],
  templateUrl: './show-scopa-points.component.html',
  styleUrl: './show-scopa-points.component.scss'
})
export class ShowScopaPointsComponent implements OnInit {
  computerPoints: number = 0;
  userPoints: number = 0;
  computerCards: any[] = []
  computerScopas: number = 0;
  userScopa: number = 0;
  userCards: any[] = [];
  options: boolean = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private matDialogRef: MatDialogRef<ShowScopaPointsComponent>) { }

  ngOnInit(): void {
    this.getData();
  }
  getData() {
    this.options = this.data[0];
    if (this.data[1] == 'computer') {
      this.computerScopas = this.data[2];
      this.computerCards = this.data[3];
      this.computerPoints = this.data[4];
    } else {
      console.log("to do ...")
    }
    this.userScopa = this.data[5];
    this.userCards = this.data[6];
    this.userPoints = this.data[7];
  }
}
