import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Chat, ChatDTO, User } from '../../../interfaces/interfaces';
import { ChatService } from '../../../services/chat.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-chat',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf, NgClass],
  templateUrl: './create-chat.component.html',
  styleUrl: './create-chat.component.scss'
})
export class CreateChatComponent implements OnInit {
  chatForm: FormGroup = new FormGroup({});
  chatTypes: string[] = ['SINGOLA', 'GRUPPO'];
  users: User[] = []
  selectedImage: File | null = null;
  choosedImageUrl: string | null = '';
  addedUsers: User[] = [];
  createdChat: Chat | null = null;
  user: User | null = null;
  constructor(private chatService: ChatService, private toastr: ToastrService, private authService: AuthService,
    private dialogRef: MatDialogRef<CreateChatComponent>
  ) { }

  ngOnInit(): void {
    this.initializeForms();
    this.getAvailableUsers();
    this.user = this.authService.getUser();
    this.addedUsers.push(this.user!);
  }

  removeUser(user: User) {
    this.addedUsers = this.addedUsers.filter(u => u.id != user.id);
  }
  getAvailableUsers() {
    return this.chatService.getAvailableUsersForChat().subscribe({
      next: (data: any) => {
        this.users = data;
      }
    })
  }
  manipulateUser(user: User, id: number) {
    let input = document.getElementById('checkbox-' + id) as HTMLInputElement;
    if (input.checked) {
      if (this.chatForm.controls['chatType'].value == "SINGOLA" && this.addedUsers.length < 2) {
        this.addedUsers.push(user);
      } else if (this.chatForm.controls['chatType'].value == "GRUPPO") {
        this.addedUsers.push(user);
      } else {
        this.toastr.warning("Puoi aggiungere solo 1 partecipante se la chat è singola.");
      }
    } else {
      this.addedUsers = this.addedUsers.filter(u => u.id != user.id);
    }
  }

  initializeForms() {
    this.chatForm = new FormGroup({
      chatType: new FormControl('', Validators.required),
      title: new FormControl(),
      image: new FormControl(''),
      users: new FormControl('')
    });
  }

  handleImageEvent(event: any) {
    this.selectedImage = event.target.files[0];
    let reader = new FileReader();

    reader.readAsDataURL(event.target.files[0]);

    reader.onload = (eventR: any) => {
      this.choosedImageUrl = eventR.target.result;
    };
  }

  cleanImage() {
    (document.getElementsByClassName('group-image')[0]! as HTMLDivElement).style.backgroundImage = "url('assets/utils/avatar.png')";
    this.selectedImage = null;
    this.choosedImageUrl = null;
  }

  saveChat() {
    let chatDTO: ChatDTO = {
      title: this.chatForm?.controls['title']?.value,
      userId: this.addedUsers?.map(u => u.id),
      chatType: this.chatForm?.controls['chatType']?.value,
      administrators: null
    }
    if (chatDTO.chatType == 'GRUPPO' && (chatDTO.title == null || chatDTO.title == undefined || chatDTO.title.length == 0 || chatDTO.title.trim().length == 0)) {
      this.toastr.warning("Se la chat è di gruppo, devi mettere il titolo.");
      return;
    }
    let choosedImage = this.selectedImage;
    this.chatService.createChat(chatDTO, choosedImage).subscribe({
      next: (data: any) => {
        this.createdChat = data;
        this.close(this.createdChat!);
      }
    });
  }

  close(element: any) {
    this.dialogRef.close(element);
  }
}