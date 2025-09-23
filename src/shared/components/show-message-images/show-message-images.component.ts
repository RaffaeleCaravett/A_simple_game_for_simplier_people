import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent } from '@angular/material/dialog';

@Component({
  selector: 'app-show-message-images',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, NgIf],
  templateUrl: './show-message-images.component.html',
  styleUrl: './show-message-images.component.scss'
})
export class ShowMessageImagesComponent implements OnInit {
  imagesUrl: string[] = [];
  index: number = 0;
  startedImagesUrl: string[] = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private matDialogRef: MatDialogRef<ShowMessageImagesComponent>) { }


  ngOnInit(): void {
    this.imagesUrl = this.data;
    this.startedImagesUrl = [...this.imagesUrl];
  }
  removePhoto(string: string) {
    this.imagesUrl = this.imagesUrl.filter(image => image != string);
    if (this.imagesUrl.length > 0) {
      this.index = this.index == 0 ? 0 : this.index - 1;
    } else {
      this.closeDialog([]);
    }
  }

  goAhed(index: number) {
    if (index == this.imagesUrl.length) {
      this.index = 0;
    } else {
      this.index = index;
    }
  }
  goBack(index: number) {
    if (index == -1) {
      this.index = (this.imagesUrl.length - 1);
    } else {
      this.index = index;
    }
  }

  closeDialog(argument?: string[]) {
    this.matDialogRef.close(argument);
  }
}
