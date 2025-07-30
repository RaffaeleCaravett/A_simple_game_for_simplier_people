import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { Chat, User } from '../../../../interfaces/interfaces';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { ChatService } from '../../../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, ReactiveFormsModule, MatMenuModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  user: User | null = null;
  windowWidth: number = 0;
  selectedChat: Chat | null = null;
  chatList: Chat[] = [];
  chatForm: FormGroup = new FormGroup({});
  isChatMenuOpen: boolean = false;
  messageForm: FormGroup = new FormGroup({});
  openedUsersForChat: User[] = [];
  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService, private chatService: ChatService) { }
  ngOnInit(): void {
    localStorage.setItem('location', 'lobby/chat');
    this.windowWidth = window.innerWidth;
    if (this.activatedRoute.snapshot.queryParams['user'] != null) {
      this.authService.getUserById(Number(JSON.parse(this.activatedRoute.snapshot.queryParams['user']))).
        subscribe({
          next: (data: any) => {
            this.user = data;
            this.getChats();
          }
        });
    } else {
      this.user = this.authService.getUser();
      this.getChats();
    }
    this.initializeForms();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.windowWidth = window.innerWidth;
  }

  getUserByExclusion(selectedChat: Chat) {
    return this.selectedChat?.utenti?.filter((u: User) => u.id != this.user?.id)[0].fullName;
  }

  openChat(chat: Chat) {
    this.selectedChat = chat;
  }

  addChat() {

  }

  initializeForms() {
    this.chatForm = new FormGroup({
      search: new FormControl('')
    });
    this.messageForm = new FormGroup({
      message: new FormControl('', [Validators.required, Validators.minLength(1)])
    });
  }
  checkIsOpenMenu(menu: HTMLDivElement) {
    if (this.chatForm.controls['search'].value.length == 1 && !this.isChatMenuOpen) {
      this.isChatMenuOpen = true;
      menu.classList.add('d-block');
      menu.classList.remove('d-none');
    } else if (this.chatForm.controls['search'].value.length == 0 && this.isChatMenuOpen) {
      this.isChatMenuOpen = false;
      menu.classList.add('d-none');
      menu.classList.remove('d-block');
    }
    else {
      this.isChatMenuOpen = this.isChatMenuOpen;
    }
  }
  getChats() {
    this.chatService.getAllChatsByUserId(this.user!.id).subscribe({
      next: (values: any) => {
        this.chatList = values;
      }
    })
  }
  getChatImage(chat: any): any {
    if (!chat?.image) {
      let utente = chat?.utenti.filter((u: User) => u.id != this.user!.id)[0] as User;
      return utente.immagineProfilo;
    }
    return null;
  }

  messageNotValid() {
    let messageValue: string = this.messageForm?.controls['message']?.value;
    return messageValue == null || messageValue == undefined || messageValue == '' || messageValue.replaceAll(" ", "").length == 0;
  }

  searchOpenedUsers() {

  }
}
