import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesManagement } from './messages-management';

describe('MessagesManagement', () => {
  let component: MessagesManagement;
  let fixture: ComponentFixture<MessagesManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagesManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessagesManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
