import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrofeiComponent } from './trofei.component';

describe('TrofeiComponent', () => {
  let component: TrofeiComponent;
  let fixture: ComponentFixture<TrofeiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrofeiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrofeiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
