import { Routes } from '@angular/router';
import { AddTrip } from './add-trip/add-trip';
import { TripListing } from './trip-listing/trip-listing'

export const routes: Routes = [
  { path: 'add-trip', component: AddTrip },
  {path: '', component: TripListing, pathMatch: 'full'}
];
