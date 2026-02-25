import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMessagesComponent } from './admin-messages.component';

describe('AdminMessagesComponent', () => {
  let component: AdminMessagesComponent;
  let fixture: ComponentFixture<AdminMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminMessagesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
