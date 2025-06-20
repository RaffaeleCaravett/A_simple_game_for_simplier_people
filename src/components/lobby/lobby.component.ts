import { Component, HostListener, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/interfaces';
import { ModeService } from '../../services/mode.service';
import { ActivatedRoute, NavigationExtras, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent implements OnInit, OnChanges {

  user: User | null;
  toggle: boolean = false;
  mode: string = 'light';
  location: string = '';
  showMenu: boolean = false;
  classificaId: number = 0;
  isLoading: boolean = false;
  canSwitchLocation: boolean = true;
  constructor(private authService: AuthService, private modeService: ModeService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.user = this.authService.getUser()
    this.modeService.mode.subscribe((data: string) => {
      this.mode = data;
    });
    if (null != this.activatedRoute.snapshot.queryParamMap.get('section')) this.location = this.activatedRoute.snapshot.queryParamMap.get('section')!;
    if (null != this.activatedRoute.snapshot.queryParamMap.get('classificaId')) this.classificaId = Number(this.activatedRoute.snapshot.queryParamMap.get('classificaId')!);
  }

  ngOnInit(): void {
    localStorage.setItem('location', 'lobby')
    this.isLoading = true;
    setTimeout(() => {
      this.location = 'giochi';
      this.isLoading = false;
    }, 1000)
  }

  navigateToProfile() {
    const navigationExtras: NavigationExtras = {
      state: {
        data: this.user
      }
    };

    this.router.navigate(['/lobby/profile'], navigationExtras);
  }
  changeLocation(location: string) {
    if (location != this.location) {
      if (!this.isLoading&&this.canSwitchLocation) {
        this.isLoading = true;
        setTimeout(() => {
          this.isLoading = false;
          this.location = location;
        }, 1000)
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isLoading = false;
  }

  onReceiveSwitchLocation(boolean: any){
    this.canSwitchLocation = boolean
  }
}
