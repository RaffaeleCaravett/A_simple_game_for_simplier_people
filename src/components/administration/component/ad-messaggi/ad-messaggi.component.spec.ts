import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdMessaggiComponent } from './ad-messaggi.component';

describe('AdMessaggiComponent', () => {
  let component: AdMessaggiComponent;
  let fixture: ComponentFixture<AdMessaggiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdMessaggiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdMessaggiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
