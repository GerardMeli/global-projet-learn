import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFilesComponent } from './admin-files.component';

describe('AdminFilesComponent', () => {
  let component: AdminFilesComponent;
  let fixture: ComponentFixture<AdminFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFilesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFilesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
