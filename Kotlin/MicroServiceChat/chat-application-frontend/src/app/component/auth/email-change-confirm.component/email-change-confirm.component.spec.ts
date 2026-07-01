import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailChangeConfirmComponent } from './email-change-confirm.component';

describe('EmailChangeConfirmComponent', () => {
  let component: EmailChangeConfirmComponent;
  let fixture: ComponentFixture<EmailChangeConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailChangeConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailChangeConfirmComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
