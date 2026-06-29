import { Routes } from '@angular/router';
import { AddTripComponent } from './add-trip/add-trip';
import { TripListing } from './trip-listing/trip-listing'
import { EditTrip } from './edit-trip/edit-trip';
import { Login } from './login/login';
import { Register } from './register/register';

export const routes: Routes = [
  { path: 'add-trip', component: AddTripComponent },
  { path: 'edit-trip', component: EditTrip },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '', component: TripListing, pathMatch: 'full' }
];
