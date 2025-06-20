import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowClassificaComponent } from './show-classifica.component';

describe('ShowClassificaComponent', () => {
  let component: ShowClassificaComponent;
  let fixture: ComponentFixture<ShowClassificaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowClassificaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowClassificaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
