import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { EmojiComponent } from '../../../../shared/components/emoji/emoji.component';
import { TextEditorComponent } from '../../../../shared/components/text-editor/text-editor.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileServive } from '../../../../services/profile.service';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../interfaces/interfaces';
import { ToastrService } from 'ngx-toastr';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { SharedModule } from '../../../../shared/modules/shared.module';
import { ModeService } from '../../../../services/mode.service';

@Component({
  selector: 'app-descrizione',
  standalone: true,
  imports: [EmojiComponent, TextEditorComponent, ReactiveFormsModule, NgClass, EmojiComponent, TextEditorComponent, NgIf, SharedModule, NgFor],
  templateUrl: './descrizione.component.html',
  styleUrl: './descrizione.component.scss'
})
export class DescrizioneComponent implements OnInit, AfterContentChecked {
  remainingCharacters: number = 5000;
  @Input() visitedUser: User | null = null;

  descrizioneInnerHTML: string = '';
  addedOptions: string[] = [];
  @ViewChild('descrizione') descrizione!: any;
  isDescrizioneLoading: boolean = true;
  textStyles: { value: string, label: string }[] = [
    { value: 'text-start', label: 'bi-text-left' },
    { value: 'text-center', label: 'bi-text-center' },
    { value: 'text-end', label: 'bi-text-right' }
  ];
  mode: string = 'light'
  constructor(private profiloService: ProfileServive, private authService: AuthService, private toastr: ToastrService, private cdr: ChangeDetectorRef,
    private modeService: ModeService) {
    this.modeService.mode.subscribe((data: string) => {
      this.mode = data;
    })
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.isDescrizioneLoading = false;
      setTimeout(() => {
        var descr = this.visitedUser?.descrizione?.innerHTML;
        this.descrizione.nativeElement.innerHTML = descr == undefined || descr == null ? '' : descr;
        if (!this.descrizione?.nativeElement?.classList.contains(this.visitedUser?.descrizione.textAlignment)) {
          this.descrizione?.nativeElement?.classList.add(this.visitedUser?.descrizione.textAlignment);
        }
        this.calculateRemainingCharacters(this.descrizione.nativeElement);
      }, 500)
    }, 2000)
  }


  calculateRemainingCharacters(descrizione: HTMLDivElement) {
    let checkTrick = (descrizione?.innerHTML === "<br>" && descrizione.innerHTML.length === 4) || descrizione.innerHTML.length == 0;
    let descrizioneLength = checkTrick ? 0 : descrizione?.innerText?.length;
    if (descrizione?.innerText?.length <= 5000) {
      this.remainingCharacters = 5000 - descrizioneLength;
    } else {
      this.remainingCharacters = 0;
      descrizione.innerText = descrizione?.innerText?.substring(0, 5000);
      if (descrizione?.innerText?.length < 5000) {
        this.remainingCharacters = 5000 - descrizioneLength;
      }
    }
    if (checkTrick) {
      descrizione.innerHTML = '';
    }
  }

  aggiungiDescrizione(descrizione: HTMLDivElement) {
    let checkTrick = (descrizione?.innerHTML === "<br>" && descrizione.innerHTML.length === 4);
    if (checkTrick) descrizione.innerHTML = '';
    if (descrizione.innerHTML.length <= 5000) {
      this.profiloService.updateDescrizione(
        {
          textAlignment:
            descrizione.classList.contains('text-center') ?
              'text-center' : descrizione.classList.contains('text-end') ?
                'text-end' : descrizione.classList.contains('text-start') ?
                  'text-start' : 'text-center',
          innerHTML: descrizione.innerHTML
        }).subscribe({
          next: (resp: any) => {
            this.authService.setUser(resp);
            this.authService.authenticateUser(true);
            this.visitedUser = resp;
            localStorage.setItem('visitedUser', JSON.stringify(resp));
            this.toastr.success("Descrizione aggiornata con successo.");
          }
        })
    } else {
      this.toastr.warning("Aggiungi una descrizione valida. Ricordati : \n " + " meno di 5000 caratteri.")
    }
  }

  onReceiveUpdatesFromTextEditor(event: any) {
    if (event.classList.contains('under-through')) {
      event.style = 'text-decoration:underline line-through;';
    } else if (event.classList.contains('underline')) {
      event.style = 'text-decoration:underline;';
    } else if (event.classList.contains('line-through')) {
      event.style = 'text-decoration:line-through;';
    }

    let outerHTML = event.outerHTML.replaceAll('&amp;nbsp;', ' ').replaceAll('&lt;div&gt;', "<div>").replaceAll('&lt;br&gt;', '<br>').replaceAll('&lt;/div&gt;', "<div>");
    this.descrizione!.nativeElement.innerHTML += outerHTML;
  }

  checkTextAreaElements() {
  }
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }
  updateDescrizioneClasslist(dClass: string) {
    if (this.descrizione.nativeElement.classList.contains(dClass)) {
      this.descrizione.nativeElement.classList.remove(dClass);
    } else {
      if (this.descrizione.nativeElement.classList.contains('text-center')) {
        this.descrizione.nativeElement.classList.remove('text-center');
      } else if (this.descrizione.nativeElement.classList.contains('text-start')) {
        this.descrizione.nativeElement.classList.remove('text-start');
      } else if (this.descrizione.nativeElement.classList.contains('text-end')) {
        this.descrizione.nativeElement.classList.remove('text-end');
      }
      this.descrizione.nativeElement.classList.add(dClass);
    }
  }

  onReceiveEmoji(event: any) {
    this.descrizione.nativeElement.innerHTML += event;
    this.calculateRemainingCharacters(this.descrizione.nativeElement);
  }
}
