import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PunteggiComponent } from './punteggi.component';

describe('PunteggiComponent', () => {
  let component: PunteggiComponent;
  let fixture: ComponentFixture<PunteggiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PunteggiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PunteggiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
