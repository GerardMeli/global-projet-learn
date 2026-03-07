import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesManagement } from './files-management';

describe('FilesManagement', () => {
  let component: FilesManagement;
  let fixture: ComponentFixture<FilesManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilesManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
