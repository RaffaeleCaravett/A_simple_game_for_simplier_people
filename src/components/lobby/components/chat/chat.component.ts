import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { Chat, ChatDTO, Message, Messaggio, User } from '../../../../interfaces/interfaces';
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { ChatService } from '../../../../services/chat.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CreateChatComponent } from '../../../../shared/components/create-chat/create-chat.component';
import { WebsocketService } from '../../../../services/websocket.service';
import { ModeService } from '../../../../services/mode.service';
import { ManageOptionsComponent } from '../../../../shared/components/manage-options/manage-options.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, ReactiveFormsModule, MatMenuModule, NgStyle],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy {
  user: User | null = null;
  windowWidth: number = 0;
  public selectedChat: Chat | null = null;
  chatList: Chat[] = [];
  chatForm: FormGroup = new FormGroup({});
  isChatMenuOpen: boolean = false;
  messageForm: FormGroup = new FormGroup({});
  openedUsersForChat: User[] = [];
  filteredChatList: Chat[] = [];
  mode: string = 'light';
  openChatOptionsMenu: boolean = false;
  chatOptionsMenu: string[] = []
  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService, private chatService: ChatService,
    private matDialog: MatDialog, private toastr: ToastrService, private ws: WebsocketService,
    private modeService: ModeService, private router: Router) {
    this.ws.messageBehaviorSubject.subscribe((value: Messaggio | null) => {
      this.chatList.forEach((chat: Chat) => {
        if (chat.id == value?.settedChatId && value?.receivers.includes(this.user!.id)) {
          chat?.messaggi?.push(value);
        } else if (chat.id == value?.settedChatId && value?.sender.id == this.user!.id) {
          chat?.messaggi?.push(value);
        }
      });
      this.scrollChatContainerBottom();
    });
    this.ws.connectionBehaviorSubject.subscribe((user: User | null) => {
      this.chatList.forEach((chat: Chat) => {
        if (chat.utenti.map((u: User) => u.id).includes(user!.id)) {
          chat.utenti.filter((u: User) => u.id == user!.id)[0].isConnected = user!.isConnected;
        }
      });
    });
    this.chatService.selectChat.subscribe((chat: number) => {
      let equalChat: Chat = this.chatList.filter((c: any) => c.id == chat)[0];
      if (equalChat && equalChat != undefined) {
        this.selectedChat = equalChat;
        this.chatService.getChatMenu(this.selectedChat.id).subscribe({
          next: (data: any) => {
            this.chatOptionsMenu = data.options;
          }
        });
      }
    });
    this.modeService.mode.subscribe((value: string) => {
      this.mode = value;
    });
  }

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

  addChat() {
    const dialogRef = this.matDialog.open(CreateChatComponent, { data: this.user });
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.getChats();
      } else {
        this.toastr.show("Non è stata creata nessuna chat.");
      }
    });
  }

  checkChat(chat: Chat): boolean {
    if (chat.utenti.length > 2) return false;
    return chat.utenti.filter((u: User) => u.id != this.user!.id)[0].isConnected;
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
        if (this.activatedRoute.snapshot.queryParams['chat'] != null) {
          this.selectedChat = JSON.parse(this.activatedRoute.snapshot.queryParams['chat']);
          setTimeout(() => {
            this.scrollChatContainerBottom();
          }, 300)
        }
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
    this.filteredChatList = [];

    if (this.chatForm.controls['search'].value.length > 0) {
      this.chatList.forEach((c: Chat) => {

        if (c.title.toLowerCase().includes(this.chatForm.controls['search'].value.toLowerCase())) {
          this.filteredChatList.push(c);
        }
        c.utenti.forEach((u: User) => {
          if (!this.filteredChatList.includes(c)) {
            if (u.id != this.user?.id && u.fullName.toLowerCase().includes(this.chatForm.controls['search'].value.toLowerCase())) {
              this.filteredChatList.push(c);
            }
          }
        });
        c.messaggi.forEach((m: Messaggio) => {
          if (!this.filteredChatList.includes(c)) {
            if (m.text.toLowerCase().includes(this.chatForm.controls['search'].value.toLowerCase())) {
              this.filteredChatList.push(c);
            }
          }
        });
      });
    }
  }

  selectChat(chat: Chat, menu: HTMLDivElement) {
    this.selectedChat = chat;
    this.openChatOptionsMenu = false;
    this.chatService.setSelectedChat(this.selectedChat);
    this.chatForm.reset();
    this.isChatMenuOpen = false;
    menu.classList.add('d-none');
    menu.classList.remove('d-block');
    this.chatService.getChatMenu(this.selectedChat.id).subscribe({
      next: (data: any) => {
        this.chatOptionsMenu = data.options;
      }
    });
    this.scrollChatContainerBottom();
  }

  scrollChatContainerBottom() {
    setTimeout(() => {
      let chatContainer = document.getElementsByClassName('message-container')[0] as HTMLDivElement;
      chatContainer.scrollTop = chatContainer.scrollHeight;
      this.readAllMessages();
    }, 200);
  }

  readAllMessages() {
    if (this.selectedChat == null) return;
    this.chatService.readMessages(this.selectedChat!.id).subscribe({
      next: (read: any) => {
        if (read) {
          this.selectedChat?.messaggi?.forEach((messaggio: Messaggio) => {
            if (messaggio?.receivers?.includes(this.user!.id)) {
              if (!messaggio?.readers) messaggio.readers = [];
              messaggio?.readers?.push(this.user!.id);
              messaggio.state = "READ";
            }
          });
        }
      }
    })
  }
  checkChatOptions() {
    this.openChatOptionsMenu = !this.openChatOptionsMenu;
  }
  sendMessage() {
    if (!this.messageNotValid()) {
      let message: Message = {
        message: this.messageForm.controls['message'].value,
        riceventi: this.selectedChat?.utenti.filter((u: User) => u.id != this.user!.id).map((u: User) => u.id) as number[],
        mittente: this.user!.id,
        chat: this.selectedChat!.id
      }

      this.chatService.sendMessage(message)
      // .subscribe((data: any) => {
      // this.selectedChat?.messaggi.push(data);
      this.messageForm.reset();
      // })
    } else {
      this.toastr.warning("Inserisci un messaggio valido");
    }
  }
  deleteSelectedChat(value: null) {
    this.selectedChat = value;
    this.openChatOptionsMenu = false;
    this.chatService.setSelectedChat(null);
  }

  ngOnDestroy(): void {
    this.chatService.setSelectedChat(null);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: any) {
    if (event && event?.code && event?.code == 'Enter' && this.selectedChat && this.messageForm.controls['message'].value) {
      this.sendMessage();
    }
  }

  checkNewMessages(chat: Chat): boolean {
    let hasNewMessages: boolean = false;
    chat?.messaggi?.forEach(m => {
      if (m?.receivers?.includes(this.user!.id) && !m?.readers?.includes(this.user!.id)) {
        hasNewMessages = true;
      }
    });
    return hasNewMessages;
  }

  manageOptions(option: string) {
    switch (option) {
      case "Info chat": {
        const dialogRef = this.matDialog.open(ManageOptionsComponent, { data: [option, this.selectedChat], width: '60%' });
        break;
      }
      case "Aggiungi partecipante": {
        const dialogRef = this.matDialog.open(ManageOptionsComponent, { data: [option, this.selectedChat], width: '60%' });
        dialogRef.afterClosed().subscribe((data: any) => {
          if (data) {
            data.push(this.user);
            let chatDTO: ChatDTO = {
              userId: data.map((u: any) => u.id),
              title: null,
              chatType: null
            }
            this.chatService.patchChat(this.selectedChat!.id, chatDTO).subscribe({
              next: (datas: any) => {
                this.selectedChat = datas;
                this.scrollChatContainerBottom();
              }
            });
          }
        });
        break;
      }
      case "Cambia foto": {
        const dialogRef = this.matDialog.open(ManageOptionsComponent, { data: [option, this.selectedChat], width: '60%' });
        dialogRef.afterClosed().subscribe((data: any) => {
          if (data) {
            this.selectedChat!.image = data;
          }
        });
        break;
      }

      case "Abbandona gruppo": {
        const dialogRef = this.matDialog.open(ManageOptionsComponent, { data: [option, this.selectedChat], width: '60%' });
        dialogRef.afterClosed().subscribe((data: any) => {
          if (data) {
            this.getChats();
          }
        });
        break;
      }
      case "Elimina chat": {
        const dialogRef = this.matDialog.open(ManageOptionsComponent, { data: [option, this.selectedChat], width: '60%' });
        dialogRef.afterClosed().subscribe((data: any) => {
          if (data) {
            this.getChats();
          }
        });
        break;
      }
      default: {
        const dialogRef = this.matDialog.open(ManageOptionsComponent, { data: [option, this.selectedChat], width: '60%' });
        dialogRef.afterClosed().subscribe((data: any) => {
          if (data) {
            this.getChats();
          }
        });
      }
    }
  }
  goToUser(userId?: number) {
    if (userId) {
      this.router.navigate(['/lobby/profile'], { queryParams: { user: userId } });
      return;
    }
    if (this.selectedChat && this.selectedChat?.chatType == 'SINGOLA') {
      this.router.navigate(['/lobby/profile'], { queryParams: { user: this.selectedChat.utenti.filter(u => { return u.id != this.user!.id })[0].id } });
    }
  }
}

