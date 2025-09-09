import { ChangeDetectorRef, Component, HostListener, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ModeService } from '../../services/mode.service';
import { ConnectionRequestDTO, Message, Messaggio, Notification, User } from '../../interfaces/interfaces';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from '../../shared/modules/shared.module';
import { WebsocketService } from '../../services/websocket.service';
import { ChatService } from '../../services/chat.service';
import { ToastrService } from 'ngx-toastr';
import { ProfileServive } from '../../services/profile.service';


@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [NgIf, NgClass, RouterLink, MatMenuModule, SharedModule, NgFor, MatProgressSpinnerModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent implements OnInit {
  innerWidth: number = 0;
  isAuthenticatedUser: boolean = false;
  mode: string = 'light';
  user: User | null = null;
  isLoadingLogoutOrRoute: boolean = false;
  notificationToRead: any = null;
  notificationMenuOpen: boolean = false;
  notifications: Notification[] = [];
  @ViewChild('pTrigger') pTrigger: any;
  @ViewChild('p1Trigger') p1Trigger: any;
  constructor(private authService: AuthService, private router: Router, private modeService: ModeService, private ws: WebsocketService, private chatService: ChatService,
    private toastr: ToastrService, private profileService: ProfileServive, private cdr: ChangeDetectorRef
  ) {
    this.authService.isAuthenticatedUser.subscribe((bool: boolean) => {
      this.isAuthenticatedUser = bool;
      this.user = this.authService.getUser();
      this.getNotifications();
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
    this.ws.connectionRequestBehaviorSubject.subscribe((data: ConnectionRequestDTO | null) => {
      if (data && data?.receiverId && data?.receiverId == this.user?.id) {
        this.toastr.show("Hai ricevuto una nuova richiesta di contatto!");
        this.getNotifications();
      }
    });

    this.authService.closeMenu.subscribe((data: string) => {
      if (data == 'close') {
        this.notificationMenuOpen = false;
      }
    })
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
          this.notificationMenuOpen = false;
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
      this.notificationMenuOpen = false;
      this.router.navigate([`/${route}`], { queryParams: { user: this.user!.id } })
    }, 1000)
  }
  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    if (this.user) {
      setTimeout(() => {
        this.getNotifications();
      }, 3000);
    } else {
      this.notificationToRead = 0;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
  }
  openNotificationMenu() {
    this.notificationMenuOpen = !this.notificationMenuOpen;
    if (!this.notificationMenuOpen) {
      let toRead: number[] = []
      this.notifications.forEach((n: Notification) => {
        if (n.state == 'SENT') {
          toRead.push(n.id);
        }
      });
      if (toRead.length > 0) {
        this.profileService.readNotification(toRead).subscribe({
          next: (data: any) => {
            if (data) {
              this.notifications.forEach((n: Notification) => {
                if (toRead.includes(n.id)) {
                  n.state = 'READ';
                  this.notificationToRead--;
                }
              });
            }
          }
        });
      }
    }
  }

  openNotification(notification: Notification) {
    let route = 'lobby/profile';
    this.openNotificationMenu();
    if (notification.notificationType == 'MESSAGE') {
      this.router.navigate(['/lobby/chat'], { queryParams: { chat: JSON.stringify(notification.chat) } });
    } else if (notification.notificationType == 'CONNECTION_REQUEST') {
      this.router.navigate([`/${route}`], { queryParams: { user: this.user!.id, request: true } })
    } else if (notification.notificationType == 'REQUEST') {
      this.router.navigate([`/${route}`], { queryParams: { user: this.user!.id, request: true } })
    } else if (notification.notificationType == 'EMAIL') {
      this.router.navigate([`/${route}`], { queryParams: { user: this.user!.id, email: true } })
    } else {
      this.toastr.show("Impossibile stabilire il tipo di notifica");
    }
  }
  getNotifications() {
    this.profileService.getNotificationsByReceiverId().subscribe({
      next: (values: any) => {
        this.notifications = values;
        this.notificationToRead = this.notifications.filter((n: Notification) => n.state == 'SENT').length;
      }
    })
  }

  closeMenu(element?: any) {
    element?.closeMenu();
    if (this.p1Trigger) {
      this.p1Trigger?.closeMenu();
    } else {
      this.pTrigger?.closeMenu();
    }
  }

}
