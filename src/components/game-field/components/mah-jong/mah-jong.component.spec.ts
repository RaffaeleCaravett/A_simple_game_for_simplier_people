import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MahJongComponent } from './mah-jong.component';

describe('MahJongComponent', () => {
  let component: MahJongComponent;
  let fixture: ComponentFixture<MahJongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MahJongComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MahJongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
