import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NounTestComponent } from './noun-test.component';

describe('NounTestComponent', () => {
  let component: NounTestComponent;
  let fixture: ComponentFixture<NounTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NounTestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NounTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
