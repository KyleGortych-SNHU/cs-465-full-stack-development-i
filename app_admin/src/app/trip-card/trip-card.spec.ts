import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripCard } from './trip-card';

describe('TripCard', () => {
  let component: TripCard;
  let fixture: ComponentFixture<TripCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TripCard);
    component = fixture.componentInstance;

    // TripCard's template binds trip immediately. @Input('trip') must be,
    // set before the first change-detection pass or the template throws on trip.name.
    // localStorage from the global setupFile.
    fixture.componentRef.setInput('trip', {
      _id: '1',
      code: 'TEST01',
      name: 'Test Trip',
      length: '7 nights',
      start: '2026-09-01T00:00:00.000Z',
      resort: 'Test Resort',
      perPerson: '1000',
      image: 'test.jpg',
      description: 'A test trip.',
    });

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
