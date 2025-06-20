import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModeService } from '../../services/mode.service';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.scss',
})
export class FormsComponent implements OnInit {
  login: FormGroup = new FormGroup({});
  signup: FormGroup = new FormGroup({});
  mode: string = 'light';
  balls: number[] = [1, 2, 3, 4, 5, 6]
  window: { innerWidth: number } = { innerWidth: 0 }
  constructor(private router: Router, private modeService: ModeService) {
    this.modeService.mode.subscribe((data: string) => {
      if (data) {
        this.mode = data;
      }
    })
  }
  ngOnInit(): void {
    this.window=window;
  }

  route(direction: string) {
    this.router.navigate([`forms/${direction}`])
  }
  @HostListener('window:resize',['event'])
  onResize(){
    this.window=window;
  }
}
