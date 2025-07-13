import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../interfaces/interfaces';
import { AuthService } from '../../services/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrl: './administration.component.scss'
})
export class AdministrationComponent implements OnInit {
  user: User | null = null;
  actionForm: FormGroup = new FormGroup({});
  innerWidth: number = 0;
  actions: string[] = ['giochi', 'categorie', 'tornei', 'utenti', 'messaggi']
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private authService: AuthService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
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
    this.initializeForms();
  }

  initializeForms() {
    this.actionForm = new FormGroup({
      action: new FormControl('', Validators.required)
    })
  }

  takeAction() {
    if (this.actionForm.valid) {

    } else {
      this.toastr.error("Seleziona una voce.");
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
  }

  switchLocation(action:string){
    this.router.navigate(['/amministrazione/'+action]);
  }
  resetFormAndLocation(){
    this.actionForm.controls['action'].setValue("");
    this.actionForm.updateValueAndValidity();
    this.router.navigate(['/amministrazione']);
  }
}
