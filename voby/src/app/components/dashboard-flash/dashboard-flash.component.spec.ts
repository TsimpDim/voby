import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFlashComponent } from './dashboard-flash.component';

describe('DashboardFlashComponent', () => {
  let component: DashboardFlashComponent;
  let fixture: ComponentFixture<DashboardFlashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardFlashComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardFlashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
