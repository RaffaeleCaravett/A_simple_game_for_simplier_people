import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent } from '@angular/material/dialog';

@Component({
  selector: 'app-show-message-images',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent],
  templateUrl: './show-message-images.component.html',
  styleUrl: './show-message-images.component.scss'
})
export class ShowMessageImagesComponent {
  imagesUrl: string[] = [];
  index: number = 0;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private matDialogRef: MatDialogRef<ShowMessageImagesComponent>) { }

  removePhoto(string: string) {
    this.imagesUrl = this.imagesUrl.filter(image => image != string);
  }

  goAhed(index: number) {
    if (index == this.imagesUrl.length) {
      this.index == 0;
    } else {
      this.index == index;
    }
  }

}
