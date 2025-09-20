import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowMessageImagesComponent } from './show-message-images.component';

describe('ShowMessageImagesComponent', () => {
  let component: ShowMessageImagesComponent;
  let fixture: ComponentFixture<ShowMessageImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowMessageImagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowMessageImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
