import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../interfaces/interfaces';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  user: User | null = null;

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService) { }
  ngOnInit(): void {
    console.log(this.activatedRoute.snapshot.queryParams['user']);
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

}
