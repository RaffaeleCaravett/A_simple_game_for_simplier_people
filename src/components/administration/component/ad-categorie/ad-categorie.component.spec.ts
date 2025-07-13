import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdCategorieComponent } from './ad-categorie.component';

describe('AdCategorieComponent', () => {
  let component: AdCategorieComponent;
  let fixture: ComponentFixture<AdCategorieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdCategorieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdCategorieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
