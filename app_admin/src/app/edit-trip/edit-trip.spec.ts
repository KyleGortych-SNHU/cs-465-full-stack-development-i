import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTrip } from './edit-trip';

describe('EditTrip', () => {
  let component: EditTrip;
  let fixture: ComponentFixture<EditTrip>;

  beforeEach(async () => {
    // Seed edit-trip so ngOnInit builds the form and follows the normal path.
    // Router & HttpClient from the global providersFile.
    localStorage.setItem('tripCode', 'TEST01');

    await TestBed.configureTestingModule({
      imports: [EditTrip],
    }).compileComponents();

    fixture = TestBed.createComponent(EditTrip);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
