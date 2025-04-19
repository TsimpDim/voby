import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordListViewComponent } from './word-list-view.component';

describe('WordListViewComponent', () => {
  let component: WordListViewComponent;
  let fixture: ComponentFixture<WordListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [WordListViewComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(WordListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
