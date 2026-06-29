import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Trip } from '../models/trip';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { BROWSER_STORAGE } from '../storage';

@Injectable({
  providedIn: 'root',
})
export class TripDataService {
  constructor(
    private http: HttpClient,
    @Inject(BROWSER_STORAGE) private storage: Storage
  ) {}

  baseUrl = 'http://localhost:3000/api';
  url = 'http://localhost:3000/api/trips';

  login(user: User, passwd: string): Observable<AuthResponse> {
    return this.handleAuthAPICall('login', user, passwd);
  }

  register(
    user: User,
    passwd: string,
    adminKey?: string
  ): Observable<AuthResponse> {
    return this.handleAuthAPICall('register', user, passwd, adminKey);
  }

  handleAuthAPICall(
    endpoint: string,
    user: User,
    passwd: string,
    adminKey?: string
  ): Observable<AuthResponse> {
    const formData: any = {
      name: user.name,
      email: user.email,
      password: passwd,
    };
    if (adminKey) {
      formData.adminKey = adminKey;
    }
    return this.http.post<AuthResponse>(
      this.baseUrl + '/' + endpoint,
      formData
    );
  }

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.url);
  }

  addTrip(formData: Trip): Observable<Trip> {
    return this.http.post<Trip>(this.url, formData);
  }

  getTrip(tripCode: string): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.url + '/' + tripCode);
  }

  updateTrip(formData: Trip): Observable<Trip> {
    // The route is PUT /trips/:tripCode and the controller looks up
    // req.params.tripCode, so the code must be in the path. Previously the
    // whole object was concatenated, producing /trips/[object Object].
    return this.http.put<Trip>(`${this.url}/${formData.code}`, formData);
  }
}
