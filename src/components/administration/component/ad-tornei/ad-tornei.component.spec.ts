import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdTorneiComponent } from './ad-tornei.component';

describe('AdTorneiComponent', () => {
  let component: AdTorneiComponent;
  let fixture: ComponentFixture<AdTorneiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdTorneiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdTorneiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
