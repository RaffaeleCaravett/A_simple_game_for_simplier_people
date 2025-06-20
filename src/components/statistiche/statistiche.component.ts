import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-statistiche',
  templateUrl: './statistiche.component.html',
  styleUrl: './statistiche.component.scss'
})
export class StatisticheComponent {
@Input() mode:string = 'light';

}
