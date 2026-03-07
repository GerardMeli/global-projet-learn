import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRommManagement } from './chat-romm-management';

describe('ChatRommManagement', () => {
  let component: ChatRommManagement;
  let fixture: ComponentFixture<ChatRommManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatRommManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatRommManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
