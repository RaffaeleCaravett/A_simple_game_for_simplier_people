import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdUtentiComponent } from './ad-utenti.component';

describe('AdUtentiComponent', () => {
  let component: AdUtentiComponent;
  let fixture: ComponentFixture<AdUtentiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdUtentiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdUtentiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
