import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { EmojiService } from '../../../services/emoji.service';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-emoji',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './emoji.component.html',
  styleUrl: './emoji.component.scss'
})
export class EmojiComponent implements OnInit {

  emojies: any[] = [];
  activities: any[] = [];
  animalsNature: any[] = [];
  flags: any[] = [];
  foodDrink: any[] = [];
  objects: any[] = [];
  peopleBody: any[] = [];
  smileysEmotion: any[] = [];
  symbols: any[] = [];
  travelPlaces: any[] = [];
  showMenu: boolean = false;
  searchEmojiesForm: FormGroup = new FormGroup({});
  emojiesSearched: boolean = false;
  @Output() sendEmoji: EventEmitter<string> = new EventEmitter<string>();
  constructor(private emojiService: EmojiService) { }

  ngOnInit(): void {
    this.emojiService.getAllEmojies().subscribe({
      next: (emojies: any) => {
        this.emojies = emojies;
        this.activities = emojies.filter((e: any) => e.field == 'activities');
        this.animalsNature = emojies.filter((e: any) => e.field == 'animals-nature');
        this.flags = emojies.filter((e: any) => e.field == 'flags');
        this.foodDrink = emojies.filter((e: any) => e.field == 'food-drink');
        this.objects = emojies.filter((e: any) => e.field == 'objects');
        this.peopleBody = emojies.filter((e: any) => e.field == 'people-body');
        this.smileysEmotion = emojies.filter((e: any) => e.field == 'smileys-emotion');
        this.symbols = emojies.filter((e: any) => e.field == 'symbols');
        this.travelPlaces = emojies.filter((e: any) => e.field == 'travel-places');
      }
    })
    this.initializeForms();
  }

  initializeForms() {
    this.searchEmojiesForm = new FormGroup({
      field: new FormControl('', [Validators.required, Validators.minLength(1)])
    });
  }

  searchEmojies() {
    if (this.searchEmojiesForm.valid) {
      this.emojiService.getByTitle(this.searchEmojiesForm.controls['field'].value).subscribe({
        next: (res: any) => {
          this.emojies = res;
        }
      })
      this.emojiesSearched = true;
    } else {
      this.emojiesSearched = false;
    }
  }

  emitEmoji(emoji: string) {
    this.sendEmoji.emit(emoji);
  }
}
