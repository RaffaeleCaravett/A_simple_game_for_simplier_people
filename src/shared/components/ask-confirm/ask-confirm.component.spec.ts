import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AskConfirmComponent } from './ask-confirm.component';

describe('AskConfirmComponent', () => {
  let component: AskConfirmComponent;
  let fixture: ComponentFixture<AskConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AskConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AskConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
