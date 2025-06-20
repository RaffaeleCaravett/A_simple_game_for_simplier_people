import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ModeService } from '../../services/mode.service';

@Component({
  selector: 'app-foot',
  standalone: true,
  imports: [NgClass],
  templateUrl: './foot.component.html',
  styleUrl: './foot.component.scss'
})
export class FootComponent {
  mode: string = 'light';

  constructor(private modeService:ModeService){
    this.modeService.mode.subscribe((data:string)=>{
      this.mode=data;
    })
  }
}
