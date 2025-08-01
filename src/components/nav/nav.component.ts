import { Component, HostListener, OnChanges, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { ModeService } from '../../services/mode.service';
import { Message, Messaggio, User } from '../../interfaces/interfaces';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from '../../shared/modules/shared.module';
import { WebsocketService } from '../../services/websocket.service';
import { ChatService } from '../../services/chat.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [NgIf, NgClass, RouterLink, MatMenuModule, SharedModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent implements OnInit {
  innerWidth: number = 0;
  isAuthenticatedUser: boolean = false;
  mode: string = 'light';
  user: User | null = null;
  isLoadingLogoutOrRoute: boolean = false;
  constructor(private authService: AuthService, private router: Router, private modeService: ModeService, private ws: WebsocketService, private chatService: ChatService,
    private toastr: ToastrService
  ) {
    this.authService.isAuthenticatedUser.subscribe((bool: boolean) => {
      this.isAuthenticatedUser = bool;
      this.user = this.authService.getUser();
    });
    this.modeService.mode.subscribe((mood: string) => {
      this.mode = mood;
    });
    this.ws.messageBehaviorSubject.subscribe((value: Messaggio | null) => {
      if ((this.chatService.getSelectedChat() == null || (this.chatService.getSelectedChat() != null && this.chatService.getSelectedChat()?.id != value?.settedChatId))
        && (this.user?.id != value?.sender.id) && value?.receivers.includes(this.user!.id)) {
        let toast: any = new Object();
        toast = this.toastr.show("Ti è arrivato un messaggio da " + value!.sender.nome);
        toast.chatId = value.settedChatId;
        toast.onTap.subscribe((action: any) => {
          if (toast && toast?.chatId) {
            this.chatService.selectChat.next(toast.chatId);
          }
        });
      }
    });
  }
  logout() {
    this.isLoadingLogoutOrRoute = true;
    setTimeout(() => {
      this.authService.connectUser(false).subscribe({
        next: (value: any) => {
          this.authService.setUser(null);
          this.authService.authenticateUser(false);
          localStorage.clear();
          this.isLoadingLogoutOrRoute = false;
          this.router.navigate(['']);
        }
      });
    }, 1000)
  }
  updateMode(value: string) {
    this.modeService.updateMode(value);
  }

  goToRoute(route: string) {
    this.isLoadingLogoutOrRoute = true;
    setTimeout(() => {
      this.isLoadingLogoutOrRoute = false;
      this.router.navigate([`/${route}`], { queryParams: { user: this.user!.id } })
    }, 1000)
  }
  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
  }
}
