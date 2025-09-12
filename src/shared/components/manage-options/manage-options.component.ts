import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { ChatService } from '../../../services/chat.service';
import { Chat, User } from '../../../interfaces/interfaces';
import { NgIf, CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';

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
  addedAdmins: User[] = [];
  addedAdminsIds: number[] = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ManageOptionsComponent>,
    private authService: AuthService, private chatService: ChatService, private router: Router) {
    this.user = this.authService.getUser()!;
  }


  ngOnInit(): void {
    this.action = this.data[0];
    this.chat = this.data[1];
    this.addedAdmins = [... this.chat!.administrators];
    this.addedAdminsIds = this.addedAdmins.map(u => u.id)!;
    this.chatService.getAvailableUsersForChat().subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          let alreadyInChatIds = this.chat?.utenti.map(u => u.id);
          data.forEach((u: User) => {
            if (!alreadyInChatIds?.includes(u.id)) {
              this.possiblesUsersToAdd.push(u);
            } else {
              if (u.id != this.user!.id) {
                this.addedUsers.push(u);
              }
            }
          })
        }
      }
    });
  }
  closeModal(params?: any) {
    this.dialogRef.close(params);
  }
  addUserToChat(user: User) {
    if (!this.addedUsers.map(u => u.id).includes(user.id)) {
      this.addedUsers.push(user);
      this.possiblesUsersToAdd = this.possiblesUsersToAdd.filter(u => u.id != user.id);
    }
  }
  removeUserFromChat(user: User) {
    if (this.addedUsers.map(u => u.id).includes(user.id)) {
      this.addedUsers = this.addedUsers.filter(u => u.id != user.id)
      this.possiblesUsersToAdd.push(user);
    }
  }

  goToUser(userId: number) {
    if (userId) {
      this.router.navigate(['/lobby/profile'], { queryParams: { user: userId } });
      return;
    }
  }
  handleAction() {
    if (this.action == "Aggiungi partecipante") {
      this.closeModal(this.addedUsers);
    }
  }
  chatNotIncludes(user: User) {
    return !this.chat?.utenti.map(us => us.id).includes(user.id);
  }
  removeAdmin(admin: User) {
    this.addedAdmins = this.addedAdmins.filter(u => u.id != admin.id);
    this.addedAdminsIds = this.addedAdmins.map(u => u.id)!;
  }
  addAdmin(admin: User) {
    if (!this.addedAdmins.includes(admin)) {
      this.addedAdmins.push(admin);
      this.addedAdminsIds = this.addedAdmins.map(u => u.id)!;
    }
  }
}
