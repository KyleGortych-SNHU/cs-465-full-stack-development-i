import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTrip } from './edit-trip';

describe('EditTrip', () => {
  let component: EditTrip;
  let fixture: ComponentFixture<EditTrip>;

  beforeEach(async () => {
    // Seed edit-trip so ngOnInit builds the form
    localStorage.setItem('tripCode', 'TEST01');

    await TestBed.configureTestingModule({
      imports: [EditTrip],
    }).compileComponents();

    fixture = TestBed.createComponent(EditTrip);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('builds the form and pre-fills the trip code', () => {
    expect(component.editForm).toBeTruthy();
    expect(component.editForm.get('code')?.value).toBe('TEST01');
  });

  it('blocks submit and messages when required fields are missing', () => {
    component.onSubmit();

    expect(component.submitted).toBe(true);
    expect(component.message).toContain('required fields');
  });
});
