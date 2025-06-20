import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-assistenza',
  templateUrl: './assistenza.component.html',
  styleUrl: './assistenza.component.scss'
})
export class AssistenzaComponent {
@Input() mode:string = 'light';
}
