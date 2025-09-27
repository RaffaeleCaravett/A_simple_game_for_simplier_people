import { NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent } from '@angular/material/dialog';
import { MessageImage, Messaggio, User } from '../../../interfaces/interfaces';
import { AuthService } from '../../../services/auth.service';

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
  message: Messaggio | null = null;
  user: User | null = null;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private matDialogRef: MatDialogRef<ShowMessageImagesComponent>,
    private authService: AuthService) { }


  ngOnInit(): void {
    this.imagesUrl = this.data[0];
    this.message = this.data[1];
    if (this.message) {
      this.user = this.authService.getUser();
      this.imagesUrl = this.message.messageImages.map(m => 'data:image/png;base64,' + m.image);
    }
    this.startedImagesUrl = [...this.imagesUrl];
  }
  removePhoto(string: string) {
    this.imagesUrl = this.imagesUrl.filter(image => image != string);
    if (this.imagesUrl?.length > 0) {
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
