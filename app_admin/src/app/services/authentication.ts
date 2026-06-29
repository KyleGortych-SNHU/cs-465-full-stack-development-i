import { Inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BROWSER_STORAGE } from '../storage';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { TripDataService } from './trip-data';

@Injectable({
  providedIn: 'root',
})
export class Authentication {
  private readonly token = signal<string>('');

  authResp: AuthResponse = new AuthResponse();

  constructor(
    @Inject(BROWSER_STORAGE) private storage: Storage,
    private tripDataService: TripDataService
  ) {
    this.token.set(this.readStoredToken());
  }

  private readStoredToken(): string {
    try {
      return this.storage.getItem('travlr-token') ?? '';
    } catch {
      return '';
    }
  }

  public getToken(): string {
    return this.token();
  }

  public saveToken(token: string): void {
    this.storage.setItem('travlr-token', token);
    this.token.set(token);
  }

  public logout(): void {
    this.storage.removeItem('travlr-token');
    this.token.set('');
  }

  private decodeToken(): any | null {
    const token = this.token();
    if (!token) {
      return null;
    }
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      this.logout();
      return null;
    }
  }

  public isLoggedIn(): boolean {
    const payload = this.decodeToken();
    if (!payload) {
      return false;
    }
    return payload.exp > Date.now() / 1000;
  }

  public isAdmin(): boolean {
    const payload = this.decodeToken();
    return this.isLoggedIn() && payload?.role === 'admin';
  }

  public getCurrentUser(): User {
    const payload = this.decodeToken();
    const { email, name } = payload ?? {};
    return { email, name } as User;
  }

  public login(user: User, passwd: string): Observable<AuthResponse> {
    return this.tripDataService.login(user, passwd).pipe(
      tap((authResp: AuthResponse) => {
        if (authResp && authResp.token) {
          this.authResp = authResp;
          this.saveToken(authResp.token);
        }
      })
    );
  }

  public register(
    user: User,
    passwd: string,
    adminKey?: string
  ): Observable<AuthResponse> {
    return this.tripDataService.register(user, passwd, adminKey).pipe(
      tap((authResp: AuthResponse) => {
        if (authResp && authResp.token) {
          this.authResp = authResp;
          this.saveToken(authResp.token);
        }
      })
    );
  }
}
