import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordDetailPanelComponent } from './word-detail-panel.component';

describe('WordDetailPanelComponent', () => {
  let component: WordDetailPanelComponent;
  let fixture: ComponentFixture<WordDetailPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [WordDetailPanelComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(WordDetailPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
