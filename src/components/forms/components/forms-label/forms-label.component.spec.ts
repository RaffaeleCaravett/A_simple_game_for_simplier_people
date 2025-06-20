import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsLabelComponent } from './forms-label.component';

describe('FormsLabelComponent', () => {
  let component: FormsLabelComponent;
  let fixture: ComponentFixture<FormsLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsLabelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormsLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
