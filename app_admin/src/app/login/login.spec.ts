import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Login } from './login';
import { Authentication } from '../services/authentication';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authMock: { login: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authMock = { login: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [{ provide: Authentication, useValue: authMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requires email and password before calling the service', () => {
    component.credentials = { name: '', email: '', password: '' };
    component.onLoginSubmit();

    expect(component.formError).toContain('required');
    expect(authMock.login).not.toHaveBeenCalled();
  });

  it('surfaces the server error message on a failed login', () => {
    authMock.login.mockReturnValue(
      throwError(() => ({ error: { message: 'Incorrect password.' } }))
    );

    component.credentials = { name: '', email: 'a@b.com', password: 'wrong' };
    component.onLoginSubmit();

    expect(component.formError).toBe('Incorrect password.');
    expect(component.isSubmitting).toBe(false);
  });

  it('falls back to a generic message when the error has no body', () => {
    authMock.login.mockReturnValue(throwError(() => ({})));

    component.credentials = { name: '', email: 'a@b.com', password: 'wrong' };
    component.onLoginSubmit();

    expect(component.formError).toContain('Login failed');
  });

  it('navigates home on a successful login', () => {
    authMock.login.mockReturnValue(of({ token: 'abc' } as any));
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true as any);

    component.credentials = { name: '', email: 'a@b.com', password: 'right' };
    component.onLoginSubmit();

    expect(navSpy).toHaveBeenCalledWith(['']);
  });
});
