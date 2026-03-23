import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgricultureComponent } from './agriculture-component';

describe('AgricultureComponent', () => {
  let component: AgricultureComponent;
  let fixture: ComponentFixture<AgricultureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgricultureComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgricultureComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
