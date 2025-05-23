import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassFormComponent } from './class-form.component';

describe('ClassFormComponent', () => {
  let component: ClassFormComponent;
  let fixture: ComponentFixture<ClassFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ClassFormComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(ClassFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
