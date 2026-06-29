import { TestBed } from '@angular/core/testing';

import { Authentication } from './authentication';

function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

const future = () => Math.floor(Date.now() / 1000) + 3600;
const past = () => Math.floor(Date.now() / 1000) - 3600;

describe('Authentication', () => {
  let service: Authentication;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Authentication);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('round-trips the token through storage', () => {
    service.saveToken('abc.def.ghi');
    expect(service.getToken()).toBe('abc.def.ghi');
    expect(localStorage.getItem('travlr-token')).toBe('abc.def.ghi');
  });

  it('clears the token on logout', () => {
    service.saveToken('abc.def.ghi');
    service.logout();
    expect(service.getToken()).toBe('');
    expect(localStorage.getItem('travlr-token')).toBe(null);
  });

  it('reports not-logged-in with no token', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('reports logged-in for an unexpired token', () => {
    service.saveToken(makeJwt({ email: 'a@b.com', name: 'A', exp: future() }));
    expect(service.isLoggedIn()).toBe(true);
  });

  it('reports not-logged-in for an expired token', () => {
    service.saveToken(makeJwt({ email: 'a@b.com', name: 'A', exp: past() }));
    expect(service.isLoggedIn()).toBe(false);
  });

  it('isAdmin() is true only for an admin role', () => {
    service.saveToken(makeJwt({ email: 'a@b.com', name: 'A', role: 'admin', exp: future() }));
    expect(service.isAdmin()).toBe(true);

    service.saveToken(makeJwt({ email: 'u@b.com', name: 'U', role: 'user', exp: future() }));
    expect(service.isAdmin()).toBe(false);
  });

  it('exposes the current user from the token payload', () => {
    service.saveToken(makeJwt({ email: 'reef@travlr.test', name: 'Reef', exp: future() }));
    const user = service.getCurrentUser();
    expect(user.email).toBe('reef@travlr.test');
    expect(user.name).toBe('Reef');
  });

  it('does not throw on a malformed token and treats it as logged-out', () => {
    service.saveToken('this-is-not-a-jwt');
    expect(() => service.isLoggedIn()).not.toThrow();
    expect(service.isLoggedIn()).toBe(false);
    // bad token is cleared
    expect(service.getToken()).toBe('');
  });
});
