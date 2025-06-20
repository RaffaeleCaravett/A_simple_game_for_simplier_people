import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiochiComponent } from './giochi.component';

describe('GiochiComponent', () => {
  let component: GiochiComponent;
  let fixture: ComponentFixture<GiochiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiochiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiochiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
