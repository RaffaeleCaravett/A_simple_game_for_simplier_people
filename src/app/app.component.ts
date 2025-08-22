import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { NavComponent } from '../components/nav/nav.component';
import { FootComponent } from '../components/foot/foot.component';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ModeService } from '../services/mode.service';
import { Subscription } from 'rxjs';
export let browserRefresh = false;
import { RxStompService } from '@stomp/ng2-stompjs';
import { ChatService } from '../services/chat.service';
import { Chat, Message, SocketDTO } from '../interfaces/interfaces';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, FootComponent, NgIf, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'game-front';
  showGoTop: boolean = false;
  mode: string = 'light';
  subscription: Subscription;
  channels: Message[] = [];
  selectedChat: Chat | null = null;
  chats: Chat[] = [];
  socketMap: Map<number, RxStompService> = new Map<number, RxStompService>();
  constructor(private modeService: ModeService, private authService: AuthService, private router: Router,
    private chatService: ChatService, private webSocketService: WebsocketService
  ) {
    this.subscription = router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        browserRefresh = !router.navigated;
      }
    });
    this.modeService.mode.subscribe((data: string) => {
      this.mode = data;
    })
    this.webSocketService.connectionBehaviorSubject.subscribe((data: any) => {
      console.log("DATA _ " + data);
    })
  }


  /*

  WEBSOCKET UTILIZED AND APPLIED FROM 

  https://github.com/bnacheva/ichat/blob/master/frontend/ichat-client/src/app/layout/users-list/users-list.component.ts
*/


  @HostListener('window:scroll', ['$event']) private onScroll(): void {
    if (window.scrollY > 500) {
      this.showGoTop = true;
    } else {
      this.showGoTop = false;
    }
  };

  ngOnInit(): void {
    let accessToken: string = localStorage.getItem('accessToken')!;
    let location: string = localStorage.getItem('location')!;
    let gioco: string = localStorage.getItem('game')!;
    let mode: string = localStorage.getItem('mode')!;
    if (accessToken) {
      this.authService.verifyAccessToken(accessToken).subscribe({
        next: (user: any) => {
          if (user) {
            this.authService.setToken(accessToken);
            this.authService.connectUser(true).subscribe({
              next: (value: any) => {
                let socketDTO: SocketDTO = {
                  messageDTO: null,
                  connectionDTO: { userId: value.id },
                  gameConnectionDTO: null,
                  moveDTO: null,
                  connectionRequestDTO: null
                }
                setTimeout(() => {
                  this.webSocketService.send(socketDTO);
                }, 2000);
                this.authService.setUser(value);
                this.authService.authenticateUser(true);
              }
            });
            setTimeout(() => {
              if (location && location == 'game-field') this.router.navigate([`/${location}`], { queryParams: { gioco: gioco } });
              else this.router.navigate([`/${location || 'home'}`]);
            }, 1500)
          }
        }
      })
    }
    else {
      localStorage.clear()
    }
    if (mode) {
      this.modeService.updateMode(mode);
    }
    setTimeout(() => {
      this.webSocketService.listen((message: any) => { });
    }, 5000)
  }

  goUp() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
  @HostListener('window:click', ['$event'])
  onWindowClick(event: any) {
    if (event?.srcElement?.className != 'bi bi-bell h2 text-danger') {
      this.authService.closeMenuF("close");
    }
  }
}
