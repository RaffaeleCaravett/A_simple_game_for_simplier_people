import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScopaComponent } from './scopa.component';

describe('ScopaComponent', () => {
  let component: ScopaComponent;
  let fixture: ComponentFixture<ScopaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScopaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScopaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
