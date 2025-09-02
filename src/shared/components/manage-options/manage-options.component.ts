import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { ChatService } from '../../../services/chat.service';
import { Chat, User } from '../../../interfaces/interfaces';
import { NgIf, CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-manage-options',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, NgIf, CommonModule, NgFor],
  templateUrl: './manage-options.component.html',
  styleUrl: './manage-options.component.scss'
})
export class ManageOptionsComponent implements OnInit {

  user: User | null = null;
  chat: Chat | null = null;
  possiblesUsersToAdd: User[] = [];
  addedUsers: User[] = [];
  action: string = '';
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ManageOptionsComponent>, private authService: AuthService, private chatService: ChatService) {
    this.user = this.authService.getUser()!;
  }


  ngOnInit(): void {
    this.action = this.data[0];
    this.chat = this.data[1];
  }
  closeModal(params?: any) {
    this.dialogRef.close();
  }
}
