import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingIndComponent } from './loading-ind.component';

describe('LoadingIndComponent', () => {
  let component: LoadingIndComponent;
  let fixture: ComponentFixture<LoadingIndComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingIndComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingIndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
