import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiocoPreviewComponent } from './gioco-preview.component';

describe('GiocoPreviewComponent', () => {
  let component: GiocoPreviewComponent;
  let fixture: ComponentFixture<GiocoPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiocoPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiocoPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
