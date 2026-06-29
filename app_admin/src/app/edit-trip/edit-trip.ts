import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { TripDataService } from '../services/trip-data';
import { Trip } from '../models/trip';

@Component({
  selector: 'app-edit-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-trip.html',
  styleUrl: './edit-trip.css',
})
export class EditTrip implements OnInit {
  public editForm!: FormGroup;
  trip!: Trip;
  submitted = false;
  message = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private tripDataService: TripDataService
  ) {}

  ngOnInit(): void {
    const tripCode = localStorage.getItem('tripCode');
    if (!tripCode) {
      alert("Something went wrong, couldn't find a stashed tripCode!");
      this.router.navigate(['']);
      return;
    }

    this.editForm = this.formBuilder.group({
      _id: [],
      code: [tripCode, Validators.required],
      name: ['', Validators.required],
      length: ['', Validators.required],
      start: ['', Validators.required],
      resort: ['', Validators.required],
      perPerson: ['', Validators.required],
      image: ['', Validators.required],
      description: ['', Validators.required],
    });

    this.tripDataService.getTrip(tripCode).subscribe({
      next: (value: Trip[]) => {
        const trip = value && value[0];
        if (!trip) {
          this.message = 'No trip retrieved!';
          return;
        }
        if (trip.start) {
          (trip as any).start = new Date(trip.start as any)
            .toISOString()
            .substring(0, 10);
        }
        this.trip = trip;
        this.editForm.patchValue(trip);
        this.message = 'Trip: ' + tripCode + ' retrieved';
      },
      error: (err: any) => {
        this.message =
          'Could not load trip: ' +
          (err?.error?.message || err?.message || err);
      },
    });
  }

  public onSubmit(): void {
    this.submitted = true;
    this.message = '';

    if (!this.editForm.valid) {
      this.message = 'Please complete all required fields before saving.';
      return;
    }

    this.tripDataService.updateTrip(this.editForm.value).subscribe({
      next: () => this.router.navigate(['']),
      error: (err: any) => {
        this.message =
          err?.error?.message ||
          (err?.status === 403
            ? 'You must be an admin to edit trips.'
            : 'Update failed. Your session may have expired — log in again.');
      },
    });
  }

  get f() {
    return this.editForm.controls;
  }
}
