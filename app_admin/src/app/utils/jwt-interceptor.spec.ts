import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { of } from 'rxjs';

import { JwtInterceptor } from './jwt-interceptor';
import { Authentication } from '../services/authentication';

describe('JwtInterceptor', () => {
  let interceptor: JwtInterceptor;
  let auth: {
    isLoggedIn: ReturnType<typeof vi.fn>;
    getToken: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Mock Authentication
    auth = {
      isLoggedIn: vi.fn().mockReturnValue(false),
      getToken: vi.fn().mockReturnValue('test-token'),
    };

    TestBed.configureTestingModule({
      providers: [
        JwtInterceptor,
        { provide: Authentication, useValue: auth },
      ],
    });

    interceptor = TestBed.inject(JwtInterceptor);
  });

  function captureHandler() {
    const ref: { forwarded?: HttpRequest<any> } = {};
    const next: HttpHandler = {
      handle: (req) => {
        ref.forwarded = req;
        return of({} as HttpEvent<any>);
      },
    };
    return { ref, next };
  }

  it('is created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('leaves the request untouched when the user is not logged in', () => {
    auth.isLoggedIn.mockReturnValue(false);

    const request = new HttpRequest('GET', '/api/trips');
    const { ref, next } = captureHandler();

    interceptor.intercept(request, next).subscribe();

    expect(ref.forwarded).toBe(request);
    expect(ref.forwarded?.headers.has('Authorization')).toBe(false);
  });

  it('does not attach a token on auth routes (login/register)', () => {
    auth.isLoggedIn.mockReturnValue(true);

    for (const url of [
      'http://localhost:3000/api/login',
      'http://localhost:3000/api/register',
    ]) {
      const request = new HttpRequest('POST', url, {});
      const { ref, next } = captureHandler();

      interceptor.intercept(request, next).subscribe();

      expect(ref.forwarded?.headers.has('Authorization')).toBe(false);
    }
  });

  it('attaches an Authorization header when logged in on a non-auth route', () => {
    auth.isLoggedIn.mockReturnValue(true);
    auth.getToken.mockReturnValue('test-token');

    const request = new HttpRequest('GET', 'http://localhost:3000/api/trips');
    const { ref, next } = captureHandler();

    interceptor.intercept(request, next).subscribe();

    expect(ref.forwarded).not.toBe(request);
    expect(ref.forwarded?.headers.has('Authorization')).toBe(true);
    expect(ref.forwarded?.headers.get('Authorization')).toBe('Bearer test-token');
  });
});
