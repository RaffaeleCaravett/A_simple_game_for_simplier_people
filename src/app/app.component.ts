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
import { Message } from '@stomp/stompjs';

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
                    value.forEach((c: any) => {
                      const channelId = this.createChannel(c.id, c.createdAt);

                      this.stompService.watch(`/channel/chat/${channelId}`).subscribe(res => {
                        const data: Message = JSON.parse(res.body);

                        /*TO IMPLEMENT LOGIC
                           if (data.channel !== this.channel) {
                             this.showNotification(data);
                           } else {
                             // send read receipt for the channel
                             this.messageService.sendReadReceipt(this.channel, otherUser.username);
                           }
                             */
                      });
                    });
                  }
                })

              }
            })
            if (location && location == 'game-field') this.router.navigate([`/${location}`], { queryParams: { gioco: gioco } });
            else this.router.navigate([`/${location || 'home'}`]);
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
