import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TripListing } from './trip-listing/trip-listing';

@Component({
  selector: 'app-root',
  imports: [ CommonModule, RouterOutlet, TripListing],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('Travlr Getaways Admin!');
}
