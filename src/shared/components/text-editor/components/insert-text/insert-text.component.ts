import { AfterContentChecked, AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProfileServive } from '../../../../../services/profile.service';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ModeService } from '../../../../../services/mode.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-insert-text',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, NgFor, NgIf, NgClass, MatDialogClose, ReactiveFormsModule],
  templateUrl: './insert-text.component.html',
  styleUrl: './insert-text.component.scss'
})
export class InsertTextComponent implements AfterContentChecked, AfterViewChecked, OnInit {
  manuallyCopiedRange: any = null;
  icons: any[] = [];
  colors: any[] = [];
  sizes: any[] = [];
  mode: string = 'light';
  separatedClasses: string = '';
  @ViewChild('testo', { static: false }) testo: any;
  remainingCharacters: number = 0;
  initialRemainingCharacters: number = 0;
  selectsForm: FormGroup = new FormGroup({});
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private profiloService: ProfileServive, private toastr: ToastrService,
    private modeService: ModeService, private matDialogRef: MatDialogRef<InsertTextComponent>, private cdr: ChangeDetectorRef) {
    this.modeService.mode.subscribe((data: string) => {
      this.mode = data;
    })
  }

  selectItems(item: string) {
    if (item == 'underline' || item == 'line-through') {
      if (this.separatedClasses.includes(item)) {
        this.separatedClasses = this.separatedClasses.replace(item, '');
        this.separatedClasses = this.separatedClasses.substring(0, this.separatedClasses.lastIndexOf(' '));
        this.testo.nativeElement.classList.remove(item);
        return;
      } else if (item == 'underline' && this.separatedClasses.includes('line-through')) {
        this.separatedClasses = this.separatedClasses.replace('line-through', '');
        this.separatedClasses = this.separatedClasses.substring(0, this.separatedClasses.lastIndexOf(' '));
        this.testo.nativeElement.classList.remove('line-through');
        this.testo.nativeElement.classList.add('under-through');
        this.separatedClasses += (' ' + 'under-through');
      } else if (item == 'line-through' && this.separatedClasses.includes('underline')) {
        this.separatedClasses = this.separatedClasses.replace('underline', '');
        this.separatedClasses = this.separatedClasses.substring(0, this.separatedClasses.lastIndexOf(' '));
        this.testo.nativeElement.classList.remove('underline');
        this.testo.nativeElement.classList.add('under-through');
        this.separatedClasses += (' ' + 'under-through');
      } else if (item == 'underline' && this.separatedClasses.includes('under-through')) {
        this.separatedClasses = this.separatedClasses.replace('under-through', '');
        this.separatedClasses = this.separatedClasses.substring(0, this.separatedClasses.lastIndexOf(' '));
        this.separatedClasses += (' ' + 'line-through');
        this.testo.nativeElement.classList.remove('under-through');
        this.testo.nativeElement.classList.add('line-through');
      } else if (item == 'line-through' && this.separatedClasses.includes('under-through')) {
        this.separatedClasses = this.separatedClasses.replace('under-through', '');
        this.separatedClasses = this.separatedClasses.substring(0, this.separatedClasses.lastIndexOf(' '));
        this.separatedClasses += (' ' + 'underline');
        this.testo.nativeElement.classList.remove('under-through');
        this.testo.nativeElement.classList.add('underline');
      } else {
        this.testo.nativeElement.classList.add(item);
        this.separatedClasses += (' ' + item);
      }
    } else {
      if (this.separatedClasses.includes(item)) {
        this.separatedClasses = this.separatedClasses.replace(item, '');
        this.separatedClasses = this.separatedClasses.substring(0, this.separatedClasses.lastIndexOf(' '));
        this.testo.nativeElement.classList.remove(item);
        return;
      }
      this.separatedClasses += (' ' + item);
      this.testo.nativeElement.classList.add(item);
    }
  }



  close(value?: boolean) {
    if (!value) {
      this.matDialogRef.close(false);
    } else {
      let span = document.createElement('span');
      if (this.separatedClasses.startsWith(' ')) {
        this.separatedClasses = this.separatedClasses.substring(1);
      }
      let classesArray: string[] = this.separatedClasses.split(' ');
      if (classesArray.length > 0) {
        for (let s of classesArray) {
          span.classList.add(s);
        }
      }
      span.textContent += this.testo?.nativeElement.innerHTML;
      this.matDialogRef.close(span);
    }
  }
  calculateRemainingCharacters(descrizione: HTMLDivElement) {
    let checkTrick = (descrizione?.innerHTML === "<br>" && descrizione.innerHTML.length === 4) || descrizione.innerHTML.length == 0;
    let descrizioneLength = checkTrick ? 0 : descrizione?.innerText?.length;
    if (descrizione?.innerText?.length <= this.initialRemainingCharacters) {
      this.remainingCharacters = this.initialRemainingCharacters - descrizioneLength;
    } else {
      this.remainingCharacters = 0;
      descrizione.innerText = descrizione?.innerText?.substring(0, this.initialRemainingCharacters);
      if (descrizione?.innerText?.length < this.initialRemainingCharacters) {
        this.remainingCharacters = this.initialRemainingCharacters - descrizioneLength;
      }
    }
    if (checkTrick) {
      descrizione.innerHTML = '';
    }

  }

  initializeForm() {
    this.selectsForm = new FormGroup({
      colors: new FormControl(''),
      sizes: new FormControl('')
    });

    this.colors.forEach(c => {
      if (c.value == this.data[0]) {
        this.selectsForm.get('colors')?.setValue(this.data[0]);
      }
    });
    this.sizes.forEach(s => {
      if (s.value == this.data[0]) {
        this.selectsForm.get('sizes')?.setValue(this.data[0]);
      }
    });
    this.selectsForm.updateValueAndValidity();
  }
  ngOnInit(): void {
    this.initializeForm();
    this.separatedClasses += this.data[0];
    setTimeout(() => {
      this.testo.nativeElement.classList.add(this.data[0]);
    }, 1000)
    this.icons = this.data[1];
    this.colors = this.data[2];
    this.sizes = this.data[3];
    this.remainingCharacters = this.data[4];
    this.initialRemainingCharacters = this.data[4];
    this.initializeForm();
  }
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }
  ngAfterViewChecked(): void {

  }
}
