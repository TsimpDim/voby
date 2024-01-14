import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordViewComponent } from './word-view.component';

describe('WordViewComponent', () => {
  let component: WordViewComponent;
  let fixture: ComponentFixture<WordViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WordViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
