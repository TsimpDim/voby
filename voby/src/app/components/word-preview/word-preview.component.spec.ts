import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordPreviewComponent } from './word-preview.component';

describe('WordPreviewComponent', () => {
  let component: WordPreviewComponent;
  let fixture: ComponentFixture<WordPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WordPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
