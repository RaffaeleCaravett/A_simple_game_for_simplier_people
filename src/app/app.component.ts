import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
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
import { Md5 } from 'ts-md5';
import { Chat, Message } from '../interfaces/interfaces';
import { INPUT_MODALITY_DETECTOR_DEFAULT_OPTIONS } from '@angular/cdk/a11y';

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
    private stompService: RxStompService, private chatService: ChatService
  ) {
    this.subscription = router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        browserRefresh = !router.navigated;
      }
    });
    this.modeService.mode.subscribe((data: string) => {
      this.mode = data;
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
                this.authService.setUser(value);
                this.authService.authenticateUser(true);
                this.chatService.getAllChatsByUserId(value.id).subscribe({
                  next: (value: any) => {
                    console.log(value)
                    this.chats = value;
                    value.forEach((c: any) => {
                      this.socketMap.set(c.id, new RxStompService);
                    });
                    console.log(this.socketMap);
                    for (let c of this.chats) {
                      const channelId = this.createChannel(c.id.toString(), c.createdAt);
                      this.socketMap.get(c.id)!.watch(`/channel/chat/${channelId}`).subscribe(res => {
                        console.log(res);
                        // const socketMessage: any = JSON.parse(res.body);
                        // this.selectedChat == this.chatService.getSelectedChat();
                        // if (socketMessage.chat == this.selectedChat?.id) {
                        //   this.chatService.readMessages(socketMessage.chat, this.authService.getUser()!.id).subscribe((data: any) => {
                        //   })
                        // }
                      });
                    }
                  }
                })

              }
            })
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
  }
  createChannel(date: string, id: string): string {
    let combined: string = '';

    return Md5.hashStr(combined).toString();
  }
  goUp() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  @HostListener('window:unload', ['$event'])
  unloadHandler(event: any) {
    this.disconnect();
  }
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: any) {
    this.disconnect();
  }
  @HostListener('window:reload', ['$event'])
  beforeReload(event: any) {
    this.disconnect();
  }

  disconnect() {
    this.authService.connectUser(false).subscribe({
      next: (value: any) => {
        this.stompService.deactivate();
        console.log("Disconnected.");
      }
    });
  }


}
