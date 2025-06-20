import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { User } from '../../interfaces/interfaces';
import { AuthService } from '../../services/auth.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { PreferitiServive } from '../../services/preferiti.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ModeService } from '../../services/mode.service';

@Component({
  selector: 'app-preferiti',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, MatTooltipModule, RouterLink, ReactiveFormsModule],
  templateUrl: './preferiti.component.html',
  styleUrl: './preferiti.component.scss'
})
export class PreferitiComponent implements OnInit, OnDestroy {
  user: User | null = null;
  visitedUser: User | null = null;
  preferiti: any = null;
  preferitiPage: number = 0;
  searchPreferitiForm: FormGroup = new FormGroup({});
  sizes: number[] = [5, 10, 20];
  orderBys: string[] = ["Id", "Nome gioco", "Data di creazione del gioco", "Data di aggiunta ai preferiti"];
  sortOrders: string[] = ["Ascendente", "Discendente"];
  difficulties: number[] = [1, 2, 3, 4, 5];
  @Input() userInput: User | null = null;
  mode: string = 'light';
  constructor(private route: ActivatedRoute, private authService: AuthService, private preferitiService: PreferitiServive,
    private toastr: ToastrService, private modeService: ModeService
  ) {
    this.modeService.mode.subscribe((data: string) => {
      this.mode = data;
    })
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (this.userInput == null) {
      localStorage.setItem('location', 'lobby/preferiti')
      this.route.queryParams.subscribe(
        params => {
          if (params['user']) {
            this.authService.getUserById(params['user']).subscribe({
              next: (data: any) => {
                if (data) {
                  this.visitedUser = data;
                  localStorage.setItem('visitedUser', JSON.stringify(this.visitedUser));
                  this.getPreferiti();

                } else {
                  if (localStorage.getItem('visitedUser')) {
                    this.visitedUser = JSON.parse(localStorage.getItem('visitedUser')!);
                    this.getPreferiti();
                  }
                }
              }
            })
          }
        }
      )
    } else {
      localStorage.setItem('location', 'lobby/profile')
      this.visitedUser = this.userInput;
      localStorage.setItem('visitedUser', JSON.stringify(this.visitedUser));
      this.getPreferiti();
    }

    if (localStorage.getItem('visitedUser')) {
      this.visitedUser = JSON.parse(localStorage.getItem('visitedUser')!);
      this.getPreferiti();
    }
    this.searchPreferitiForm = new FormGroup({
      size: new FormControl(5),
      orderBy: new FormControl('Id'),
      sortOrder: new FormControl('Discendente'),
      nomeGioco: new FormControl(''),
      difficoltaGioco: new FormControl()
    });
  }

  ngOnDestroy(): void {
    localStorage.removeItem('visitedUser');
  }

  getPreferiti() {
    let sortOrder = this.searchPreferitiForm.get('sortOrder')?.value == 'Discendente' ? 'DESC' : 'ASC';
    let orderBy = this.searchPreferitiForm.get('orderBy')?.value == 'Id' ?
      'id' : this.searchPreferitiForm.get('orderBy')?.value == 'Nome gioco' ?
        'gioco.nomeGioco' : this.searchPreferitiForm.get('orderBy')?.value == 'Data di creazione del gioco' ?
          'gioco.createdAt' : this.searchPreferitiForm.get('orderBy')?.value == 'Data di aggiunta ai preferiti' ?
            'createdAt' : 'id'

    this.preferitiService.getPreferiti(this.visitedUser!.id,
      this.preferitiPage,
      this.searchPreferitiForm.get('size')?.value || 5,
      orderBy,
      sortOrder,
      this.searchPreferitiForm.get('nomeGioco')?.value,
      this.searchPreferitiForm.get('difficoltaGioco')?.value).subscribe({
        next: (data: any) => {
          this.preferiti = data;
        }
      })
  }

  deletePreferito(preferitoId: number) {
    this.preferitiService.deletePreferito(preferitoId).subscribe({
      next: (data: any) => {
        if (data) {
          this.toastr.success("Gioco rimosso dai preferiti.");
          this.getPreferiti();
        } else {
          this.toastr.error("Gioco non rimosso. Riprova o contatta l'assistenza.");
        }
      }
    })
  }
}
