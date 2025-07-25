import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../interfaces/interfaces';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgClass],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  user: User | null = null;
  windowWidth: number = 0;
  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService) { }
  ngOnInit(): void {
    this.windowWidth = window.innerWidth;
    if (this.activatedRoute.snapshot.queryParams['user'] != null) {
      this.authService.getUserById(Number(JSON.parse(this.activatedRoute.snapshot.queryParams['user']))).
        subscribe({
          next: (data: any) => {
            this.user = data;
          }
        });
    } else {
      this.user = this.authService.getUser();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.windowWidth = window.innerWidth;
  }
}
