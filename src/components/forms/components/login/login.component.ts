import { AfterViewInit, Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ModeService } from '../../../../services/mode.service';
import { FormsService } from '../../../../services/forms.service';
import { ShowErrorService } from '../../../../services/show-error.service';
import { AuthService } from '../../../../services/auth.service';
import { AuthGuard } from '../../../../core/auth.guard';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { secretEnvironment } from '../../../../secret/secret';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {

  loginForm: FormGroup = new FormGroup({});
  isLoginFormSubmitted: boolean = false;
  isOpen: boolean = false;
  canMoveMenu: boolean = false;
  mode: string = 'light';
  showSpinner: boolean = false;
  showInsertCode: boolean = false;
  previousEmail: string = '';
  interval: ReturnType<typeof setTimeout> = setTimeout(() => { });
  codeDeleted: boolean = false;
  codeForm: FormGroup = new FormGroup({});

  constructor(private toastr: ToastrService, private router: Router, private modeService: ModeService, private formsService: FormsService,
    private authService: AuthService, private authGuard: AuthGuard, private errorService: ShowErrorService
  ) {
    this.modeService.mode.subscribe((data: string) => {
      if (data) {
        this.mode = data;
      }
    })
    this.errorService.showSpinner.subscribe((data: boolean) => {
      this.showSpinner = data;
    })
    this.formsService.requestLoginCode.subscribe((data: any) => {
      if (data == "Abbiamo inviato un codice alla mail da te indicata. Inseriscilo qui sotto.") {
        this.previousEmail = this.loginForm.get('email')?.value;
        this.showInsertCode = true;
        clearTimeout(this.interval);
        this.interval = setTimeout(() => {
          this.showInsertCode = false;
          this.formsService.clearCode(this.loginForm.get('email')?.value).subscribe({ next: (data: any) => { this.codeDeleted = true; } })
          console.log('timed out');
        }, 120000)
      } else {
        this.showInsertCode = false;
      }
    })
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)])
    })
    this.codeForm = new FormGroup({
      firstLetter: new FormControl('', [Validators.required, Validators.maxLength(1)]),
      secondLetter: new FormControl('', [Validators.required, Validators.maxLength(1)]),
      thirdLetter: new FormControl('', [Validators.required, Validators.maxLength(1)]),
      fourthLetter: new FormControl('', [Validators.required, Validators.maxLength(1)]),
      fifthLetter: new FormControl('', [Validators.required, Validators.maxLength(1)]),
      sixthLetter: new FormControl('', [Validators.required, Validators.maxLength(1)])
    });
    this.codeForm.disable();
    this.codeForm.get('firstLetter')?.enable();
    this.codeForm.updateValueAndValidity();
    let isUserAuthenticated = this.authGuard.isAuthenticated;
    if (isUserAuthenticated) {
      this.authService.setToken('');
      this.authService.setUser(null)
      this.authService.authenticateUser(false);
      localStorage.clear()
      this.toastr.show("Logout avvenuto con successo.")
    }
    this.onResize()
  }

  login() {
    this.isLoginFormSubmitted = true;
    this.codeDeleted = false;
    if (this.showInsertCode && this.previousEmail == this.loginForm.get('email')?.value) this.toastr.show("Ti abbiamo già mandato un codice per mail, inseriscilo qui. E' valido per 2 minuti.")
    else
      if (this.loginForm.get('email')!.valid && this.loginForm.get('password')!.valid) {
        this.showInsertCode = false;
        this.showSpinner = true;
        this.formsService.logIn(
          {
            email: this.loginForm.controls['email'].value,
            password: this.loginForm.controls['password'].value
          }
        ).subscribe({
          next: (data: any) => {
            if (data) {
              setTimeout(() => {
                this.showSpinner = false;
                this.toastr.show("Login effettuato.");
                this.authService.setToken(data?.token?.accessToken);
                localStorage.setItem('refreshToken', data?.token?.refreshToken);
                localStorage.setItem('accessToken', data?.token?.accessToken);
                this.authService.setUser(data.user);
                this.authService.authenticateUser(true);
                this.router.navigate(['lobby']);
              }, 1000)
            }
          }
        })
      } else {
        this.toastr.error("Completa correttamente il form!")
      }
  }

  toggleMenu(open: boolean) {
    this.isOpen = open;
  }

  switchRoute(route: string) {
    route == 'forms' ? this.router.navigate(['forms']) : this.router.navigate(['forms/signup'])
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth < 630) {
      for (let i = 1; i <= 4; i++) {
        let div = document.getElementsByClassName(`box-${i}`)[0] as HTMLDivElement;
        if (div) {
          div.style.visibility = 'hidden'
        }
      }
    } else {
      for (let i = 1; i <= 4; i++) {
        let div = document.getElementsByClassName(`box-${i}`)[0] as HTMLDivElement;
        if (div) {
          div.style.visibility = 'visible'
        }
      }
    }
  }
  ngOnDestroy(): void {
    clearTimeout(this.interval);
  }

  validateCode() {
    if (this.codeForm.valid) {
      let code = this.codeForm.get('firstLetter')?.value + this.codeForm.get('secondLetter')?.value + this.codeForm.get('thirdLetter')?.value + this.codeForm.get('fourthLetter')?.value
        + this.codeForm.get('fifthLetter')?.value + this.codeForm.get('sixthLetter')?.value
      this.formsService.verifyCode(this.loginForm.get('email')?.value, code, true).subscribe({
        next: (data: any) => {
          if (data) {
            this.previousEmail = '';
            this.showInsertCode = false;
            this.login();
          }
        }
      })
    } else {
      this.toastr.error("Inserisci il codice prima.")
    }
  }

  updateCodeForm() {
    if (this.codeForm.get('firstLetter')?.value == '') {
      this.codeForm.disable();
      this.codeForm.reset();
      this.codeForm.get('firstLetter')?.enable();
    } else if (this.codeForm.get('firstLetter')?.value.length > 0) {
      this.codeForm.get('secondLetter')?.enable();
      if (this.codeForm.get('firstLetter')?.value.length > 1) this.codeForm.get('firstLetter')?.setValue(this.codeForm.get('firstLetter')?.value.substring(0, 1));
    }

    if (this.codeForm.get('secondLetter')?.value == '') {
      let firstLetterValue = this.codeForm.get('firstLetter')?.value;
      this.codeForm.disable();
      this.codeForm.reset();
      this.codeForm.get('firstLetter')?.enable();
      this.codeForm.get('secondLetter')?.enable();
      this.codeForm.get('firstLetter')?.setValue(firstLetterValue);
    } else if (this.codeForm.get('secondLetter')?.value.length > 0) {
      this.codeForm.get('thirdLetter')?.enable();
      if (this.codeForm.get('secondLetter')?.value.length > 1) this.codeForm.get('secondLetter')?.setValue(this.codeForm.get('secondLetter')?.value.substring(0, 1));
    }

    if (this.codeForm.get('thirdLetter')?.value == '') {
      let firstLetterValue = this.codeForm.get('firstLetter')?.value;
      let secondLetterValue = this.codeForm.get('secondLetter')?.value;

      this.codeForm.disable();
      this.codeForm.reset();

      this.codeForm.get('firstLetter')?.enable();
      this.codeForm.get('secondLetter')?.enable();
      this.codeForm.get('thirdLetter')?.enable();

      this.codeForm.get('firstLetter')?.setValue(firstLetterValue);
      this.codeForm.get('secondLetter')?.setValue(secondLetterValue);

    } else if (this.codeForm.get('thirdLetter')?.value.length > 0) {
      this.codeForm.get('fourthLetter')?.enable();
      if (this.codeForm.get('thirdLetter')?.value.length > 1) this.codeForm.get('thirdLetter')?.setValue(this.codeForm.get('thirdLetter')?.value.substring(0, 1));
    }

    if (this.codeForm.get('fourthLetter')?.value == '') {
      let firstLetterValue = this.codeForm.get('firstLetter')?.value;
      let secondLetterValue = this.codeForm.get('secondLetter')?.value;
      let thirdLetterValue = this.codeForm.get('thirdLetter')?.value;

      this.codeForm.disable();
      this.codeForm.reset();
      this.codeForm.get('firstLetter')?.enable();
      this.codeForm.get('secondLetter')?.enable();
      this.codeForm.get('thirdLetter')?.enable();
      this.codeForm.get('fourthLetter')?.enable();


      this.codeForm.get('firstLetter')?.setValue(firstLetterValue);
      this.codeForm.get('secondLetter')?.setValue(secondLetterValue);
      this.codeForm.get('thirdLetter')?.setValue(thirdLetterValue);

    } else if (this.codeForm.get('fourthLetter')?.value.length > 0) {
      this.codeForm.get('fifthLetter')?.enable();
      if (this.codeForm.get('fourthLetter')?.value.length > 1) this.codeForm.get('fourthLetter')?.setValue(this.codeForm.get('fourthLetter')?.value.substring(0, 1));
    }
    if (this.codeForm.get('fifthLetter')?.value == '') {
      let firstLetterValue = this.codeForm.get('firstLetter')?.value;
      let secondLetterValue = this.codeForm.get('secondLetter')?.value;
      let thirdLetterValue = this.codeForm.get('thirdLetter')?.value;
      let fourthLetterValue = this.codeForm.get('fourthLetter')?.value;

      this.codeForm.disable();
      this.codeForm.reset();
      this.codeForm.get('firstLetter')?.enable();
      this.codeForm.get('secondLetter')?.enable();
      this.codeForm.get('thirdLetter')?.enable();
      this.codeForm.get('fourthLetter')?.enable();
      this.codeForm.get('fifthLetter')?.enable();


      this.codeForm.get('firstLetter')?.setValue(firstLetterValue);
      this.codeForm.get('secondLetter')?.setValue(secondLetterValue);
      this.codeForm.get('thirdLetter')?.setValue(thirdLetterValue);
      this.codeForm.get('fourthLetter')?.setValue(fourthLetterValue);

    } else if (this.codeForm.get('fifthLetter')?.value.length > 0) {
      this.codeForm.get('sixthLetter')?.enable();
      if (this.codeForm.get('fifthLetter')?.value.length > 1) this.codeForm.get('fifthLetter')?.setValue(this.codeForm.get('fifthLetter')?.value.substring(0, 1));
    }

    if (this.codeForm.get('sixthLetter')?.value.length > 1) this.codeForm.get('sixthLetter')?.setValue(this.codeForm.get('sixthLetter')?.value.substring(0, 1));

    this.codeForm.updateValueAndValidity();
  }

  ngAfterViewInit() {
  }

  //FOLLOWED THIS TUTORIAL https://danielk.tech/home/angular-firebase-authentication-with-google
  // + Gemini 

  app = initializeApp(secretEnvironment);
  auth = getAuth(this.app);
  provider = new GoogleAuthProvider();
  async signInWithGoogle() { 
    try {
      const result = await signInWithPopup(this.auth, this.provider); 
      const user = result.user;
      if(user && user.emailVerified == true){
        let googleUser = {
          fullname: user.displayName,
          email: user.email,
          immagineProfilo: user.photoURL
        }
        this.formsService.signupGoogleUser(googleUser).subscribe({
          next:(data:any)=>{
            this.toastr.show("Registrazione avvenuta  con successo!");
          }
        })
      }
    } catch (error: any) { 
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode === 'auth/network-request-failed') {
        this.toastr.warning('C\'è stato un problema di rete. Per favore verifica la tua connessione.');
      } else {
        this.toastr.error('Si è verificato il seguente errore : ' + errorMessage);
      }
    }
  }

}
