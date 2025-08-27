import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-chat',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf, NgClass],
  templateUrl: './create-chat.component.html',
  styleUrl: './create-chat.component.scss'
})
export class CreateChatComponent implements OnInit {
  chatForm: FormGroup = new FormGroup({});
  chatTypes: string[] = ['SINGOLA', 'GRUPPO'];

  ngOnInit(): void {
    this.initializeForms();
  }


  initializeForms() {
    this.chatForm = new FormGroup({
      chatType: new FormControl('', Validators.required),
      title: new FormControl(),
      image: new FormControl(''),
      users: new FormControl('')
    });
  }
}
