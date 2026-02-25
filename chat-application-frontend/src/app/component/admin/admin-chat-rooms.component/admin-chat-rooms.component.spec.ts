import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminChatRoomsComponent } from './admin-chat-rooms.component';

describe('AdminChatRoomsComponent', () => {
  let component: AdminChatRoomsComponent;
  let fixture: ComponentFixture<AdminChatRoomsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminChatRoomsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminChatRoomsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
