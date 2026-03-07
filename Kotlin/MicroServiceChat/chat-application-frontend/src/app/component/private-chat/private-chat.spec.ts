import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateChat } from './private-chat';

describe('PrivateChat', () => {
  let component: PrivateChat;
  let fixture: ComponentFixture<PrivateChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateChat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivateChat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
