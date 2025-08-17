import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleWordRowComponent } from './single-word-row.component';

describe('SingleWordRowComponent', () => {
  let component: SingleWordRowComponent;
  let fixture: ComponentFixture<SingleWordRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleWordRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleWordRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
