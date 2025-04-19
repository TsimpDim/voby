import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwentyTestComponent } from './twenty-test.component';

describe('TwentyTestComponent', () => {
  let component: TwentyTestComponent;
  let fixture: ComponentFixture<TwentyTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TwentyTestComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(TwentyTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
