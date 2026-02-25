import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { PrivateChat } from './private-chat';
import { PrivateChatComponent } from '../../chats/private-chat/private-chat/private-chat';

describe('PrivateChat', () => {
  let component: PrivateChatComponent;
  let fixture: ComponentFixture<PrivateChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivateChatComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
