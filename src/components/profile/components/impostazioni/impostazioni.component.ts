import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { User } from '../../../../interfaces/interfaces';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProfileServive } from '../../../../services/profile.service';
import { MatDialog } from '@angular/material/dialog';
import { RichiestaComponent } from '../../../../shared/components/richiesta/richiesta.component';
import { FormsService } from '../../../../services/forms.service';
import { AuthService } from '../../../../services/auth.service';
import { SharedModule } from '../../../../shared/modules/shared.module';

@Component({
  selector: 'app-impostazioni',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, MatTooltipModule, NgFor, SharedModule, NgClass],
  templateUrl: './impostazioni.component.html',
  styleUrl: './impostazioni.component.scss'
})
export class ImpostazioniComponent implements OnInit, OnDestroy, OnChanges {
  @Input() section: string = '';
  @Input() user: User | null = null;
  assistenzaForm: FormGroup = new FormGroup({});
  richieste: any = null;
  richiestaPage: number = 0;
  richiestaParametersForm: FormGroup = new FormGroup({});
  richiestaSizes: number[] = [5, 10, 20];
  richiestaSorts: string[] = ['id', 'oggetto', 'descrizione', 'data di caricamento'];
  richiestaOrders: any[] = [['Dal primo all\'ultimo', 'ASC'], ['Dall\'ultimo al primo', 'DESC']];
  altreImpostazioniForm: FormGroup = new FormGroup({});
  citta: any[] = [];
  cambiaPassword: FormGroup = new FormGroup({});
  isCodeRequeste: boolean = false;
  isCodeVerified: boolean = false;
  codeForm: FormGroup = new FormGroup({});
  codeInterval: any;
  codeTimeout: any;
  secondsToInterval: number = 30;
  immagineForm: FormGroup = new FormGroup({});
  selectedImage: any = null;
  url: string = '';
  @ViewChild('descrizione', { static: false }) descrizione!: any;
  descrizioneUploaded: boolean = false;
  descrizioneText: string = '';
  icons: Set<{ value: string, label: string }> = new Set([
    { value: 'fw-bold', label: 'bi-type-bold' },
    { value: 'fst-italic', label: 'bi-type-italic' },
    { value: 'underline', label: 'bi-type-underline' },
    { value: 'line-through', label: 'bi-type-strikethrough' },
    { value: 'text-center', label: 'bi-text-center' },
    { value: 'text-start', label: 'bi-text-left' },
    { value: 'text-end', label: 'bi-text-right' }
  ]);
  colors: Set<{ value: string, label: string }> = new Set([
    { value: 'text-dark', label: 'dark' },
    { value: 'text-white', label: 'white' },
    { value: 'text-danger', label: 'red' },
    { value: 'text-warning', label: 'yellow' },
    { value: 'text-success', label: 'green' },
    { value: 'text-primary', label: 'blue' },
    { value: 'text-info', label: 'light blue' },
    { value: 'text-secondary', label: 'gray' }
  ]);
  sizes: Set<{ value: string, label: string }> = new Set([
    { value: 'fs-5', label: 'smaller' },
    { value: 'fs-4', label: 'small' },
    { value: 'fs-3', label: 'medium' },
    { value: 'fs-2', label: 'big' },
    { value: 'fs-1', label: 'bigger' }
  ]);
  @Input('mode') mode:string = 'light';
  constructor(private toastr: ToastrService, private profileService: ProfileServive, private datePipe: DatePipe, private matDialog: MatDialog,
    private formService: FormsService, private authService: AuthService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.section != 'Cambia la password') {
      this.codeForm.reset();
      this.cambiaPassword.reset();
    }
  }

  ngOnDestroy(): void {
    this.codeForm.reset();
    this.cambiaPassword.reset();
  }
  ngOnInit(): void {
    this.assistenzaForm = new FormGroup({
      oggetto: new FormControl('', Validators.required),
      descrizione: new FormControl('', Validators.required)
    });
    this.richiestaParametersForm = new FormGroup({
      size: new FormControl(5),
      sort: new FormControl('id'),
      order: new FormControl('ASC'),
      oggetto: new FormControl(''),
      descrizione: new FormControl(''),
      from: new FormControl(''),
      to: new FormControl('')
    });
    this.altreImpostazioniForm = new FormGroup({
      nome: new FormControl(this.user!.nome, Validators.required),
      cognome: new FormControl(this.user!.cognome, Validators.required),
      citta: new FormControl(this.user!.citta.id, Validators.required)
    });
    this.cambiaPassword = new FormGroup({
      nuovaPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
      ripetiNuovaPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    })
    this.codeForm = new FormGroup({
      code: new FormControl('', [Validators.required, Validators.minLength(6)])
    })
    this.getRichieste();
    this.getCitta();
  }

  inviaRichiesta() {
    if (this.assistenzaForm.valid) {
      let richiesta: any = {
        userId: this.user!.id,
        oggetto: this.assistenzaForm.get('oggetto')?.value,
        descrizione: this.assistenzaForm.get('descrizione')?.value
      }
      this.profileService.postRichiestaAssistenza(richiesta).subscribe({
        next: (data: any) => {
          this.toastr.success("Richiesta inviata.");
          this.assistenzaForm.reset();
          this.getRichieste();
        }
      })
    } else {
      this.toastr.show('Inserisci i campi richiesti.')
    }
  }

  getRichieste() {
    this.profileService.getRichiesteByUserId(this.user!.id).subscribe({
      next: (data: any) => {
        this.richieste = data;
      }
    })
  }

  format(date: string) {
    return this.datePipe.transform(date, 'dd/MM/yyyy')
  }

  modifyRichiesta(richiesta: any) {
    const dialogRef = this.matDialog.open(RichiestaComponent, { data: [richiesta, this.user] })
    dialogRef.afterClosed().subscribe({
      next: (data: any) => {
        if (data == true) {
          this.getRichieste();
        }
      }
    });
  }

  getRichiesteByParams() {
    let areDateValid: boolean = true;
    if ((this.richiestaParametersForm.get('from')?.value && !this.richiestaParametersForm.get('to')?.value) ||
      (!this.richiestaParametersForm.get('from')?.value && this.richiestaParametersForm.get('to')?.value)) {
      this.toastr.error("Inserisci da quando a quando.");
      areDateValid = false;
    }
    if (areDateValid) {
      this.profileService.getRichiesteByFilters(
        this.user!.id,
        this.richiestaParametersForm.get('oggetto')?.value,
        this.richiestaParametersForm.get('descrizione')?.value,
        this.richiestaParametersForm.get('from')?.value,
        this.richiestaParametersForm.get('to')?.value,
        this.richiestaPage,
        this.richiestaParametersForm.get('size')?.value,
        this.richiestaParametersForm.get('sort')?.value,
        this.richiestaParametersForm.get('order')?.value,
      ).subscribe({
        next: (data: any) => {
          this.richieste = data;
        }
      })
    }
  }
  getCitta() {
    this.formService.getCities().subscribe({
      next: (data: any) => {
        this.citta = data;
      }
    })
  }
  updateProfile() {
    console.log(this.descrizione)
    // if (this.altreImpostazioniForm.valid) {
    //   let user: any = {
    //     nome: this.altreImpostazioniForm.get('nome')?.value,
    //     cognome: this.altreImpostazioniForm.get('cognome')?.value,
    //     cittaId: this.altreImpostazioniForm.get('citta')?.value,
    //     descrizione: this.descrizione.nativeElement.innerHTML,
    //   }

    //   this.profileService.putUser(user, this.user!.id).subscribe({
    //     next: (user: any) => {
    //       this.user = user;
    //       this.authService.setUser(user);
    //       this.authService.isAuthenticatedUser.next(true);
    //       this.toastr.success("Profilo aggiornato!");
    //     }
    //   })

    // } else {
    //   this.toastr.show("Completa correttamente il form");
    // }
  }
  putPassword(form?: any) {
    if (this.cambiaPassword.valid) {
      if (this.cambiaPassword.get('nuovaPassword')?.value == this.cambiaPassword.get('ripetiNuovaPassword')?.value) {
        if (!this.isCodeRequeste) {
          this.profileService.askCode(this.user!.email, false).subscribe((data: any) => {
            if (data) {
              this.isCodeRequeste = true;
              this.toastr.show("Ti abbiamo mandato un codice via mail, inseriscilo nel riquadro.")
              this.codeInterval = setInterval(() => {
                if (this.secondsToInterval > 0) this.secondsToInterval -= 1;
              }, 1000);
              this.codeTimeout = setTimeout(() => {
                clearInterval(this.codeInterval);
                this.secondsToInterval = 30;
                this.isCodeRequeste = false;
                this.profileService.clearUserCode(this.user!.email).subscribe({
                  next: (data: any) => {
                    this.codeForm.reset();
                    this.toastr.show("Richiedi un altro codice.");
                  }
                })
              }, 30000);
            }
          });
        } else {
          if (this.isCodeVerified) {
            this.profileService.changePassword(this.cambiaPassword.get('nuovaPassword')?.value, this.user!.email, this.codeForm.get('code')?.value).subscribe({
              next: (data: any) => {
                this.toastr.success("Password cambiata.");
                this.isCodeRequeste = false;
                this.isCodeVerified = false;
                this.codeForm.reset();
                this.cambiaPassword.reset();
                this.cambiaPassword.updateValueAndValidity();
                form.submitted = false;
                this.profileService.clearUserCode(this.user!.email).subscribe({
                  next: (data: any) => { }
                });
              }
            })
          } else {
            if (this.codeForm.valid) {
              this.profileService.verifyCode(this.user!.email, this.codeForm.get('code')?.value, false).subscribe({
                next: (data: any) => {
                  if (data) {
                    this.isCodeVerified = true;
                  } else {
                    this.isCodeVerified = false;
                    this.toastr.error("Il codice non è giusto");
                  }
                }
              })
            } else {
              this.isCodeVerified = false;
              if (!this.codeForm.get('code')?.value) this.toastr.error("Non hai inserito il codice!");
              else this.toastr.error("Il codice deve contenere 6 lettere/caratteri.")
            }
          }
        }
      } else {
        this.toastr.error("Le nuove password che hai inserito non coincidono");
      }
    } else {
      this.toastr.error("Assicurati di inserire la tua vecchia password e la password nuova.");
    }
  }

  changeImage(event: any) {
    if (event && event?.target?.files && event?.target?.files[0]) {
      this.selectedImage = event.target.files[0];
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]);

      reader.onload = (eventR: any) => {
        this.url = eventR.target.result;
      };
    } else {
      this.url = '';
      this.selectedImage = null;
    }
  }

  putImage() {
    if (this.selectedImage) {
      this.profileService.putImage(this.selectedImage).subscribe({
        next: (data: any) => {
          this.authService.setUser(data);
          this.authService.isAuthenticatedUser.next(true);
          this.toastr.success("Immagine cambiata con successo.");
          this.selectedImage = null;
          this.url = '';
        }
      })
    } else {
      this.toastr.error("Non hai caricato nessuna nuova immagine.");
    }
  }
}