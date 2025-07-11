import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../interfaces/interfaces';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrl: './administration.component.scss'
})
export class AdministrationComponent implements OnInit {
  user: User | null = null;
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    let userId: any = null;
    if (this.activatedRoute?.snapshot?.queryParams['user']) {
      userId = JSON.parse(this.activatedRoute?.snapshot?.queryParams['user']);
      this.authService.getUserById(userId).subscribe({
        next: (user: any) => {
          this.user = user;
          if (this.user?.role == 'Admin') localStorage.setItem('location', 'amministrazione');
          else this.router.navigate([`/${localStorage.getItem('location') ? localStorage.getItem('location') : 'home'}`])
        }
      })
    } else if (localStorage.getItem('user')) {
      this.user = JSON.parse(localStorage.getItem('user')!);
      if (this.user?.role == 'Admin') localStorage.setItem('location', 'amministrazione');
      else this.router.navigate([`/${localStorage.getItem('location') ? localStorage.getItem('location') : 'home'}`])
    } else {
      this.router.navigate([`/${localStorage.getItem('location') ? localStorage.getItem('location') : 'home'}`])
    }
  }
}
