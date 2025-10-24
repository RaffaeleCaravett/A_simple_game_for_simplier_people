import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowScopaPointsComponent } from './show-scopa-points.component';

describe('ShowScopaPointsComponent', () => {
  let component: ShowScopaPointsComponent;
  let fixture: ComponentFixture<ShowScopaPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowScopaPointsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowScopaPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
