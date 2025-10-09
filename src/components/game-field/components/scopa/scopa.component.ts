import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scopa',
  standalone: true,
  imports: [],
  templateUrl: './scopa.component.html',
  styleUrl: './scopa.component.scss'
})
export class ScopaComponent {
  @Input() game: number = 0;
}
