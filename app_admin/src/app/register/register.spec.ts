import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Register } from './register';
import { Authentication } from '../services/authentication';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let authMock: { register: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authMock = { register: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [{ provide: Authentication, useValue: authMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requires name, email and password', () => {
    component.credentials = { name: '', email: '', password: '', adminKey: '' };
    component.onRegisterSubmit();

    expect(component.formError).toContain('required');
    expect(authMock.register).not.toHaveBeenCalled();
  });

  it('passes the admin key through to the service and navigates home', () => {
    authMock.register.mockReturnValue(of({ token: 'abc' } as any));
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true as any);

    component.credentials = {
      name: 'Admin',
      email: 'admin@b.com',
      password: 'pw',
      adminKey: 'secret-code',
    };
    component.onRegisterSubmit();

    expect(authMock.register).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'admin@b.com', name: 'Admin' }),
      'pw',
      'secret-code'
    );
    expect(navSpy).toHaveBeenCalledWith(['']);
  });

  it('sends undefined for the admin key when left blank (standard user)', () => {
    authMock.register.mockReturnValue(of({ token: 'abc' } as any));

    component.credentials = {
      name: 'Plain',
      email: 'plain@b.com',
      password: 'pw',
      adminKey: '',
    };
    component.onRegisterSubmit();

    expect(authMock.register).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'plain@b.com' }),
      'pw',
      undefined
    );
  });

  it('surfaces the server error message (e.g. wrong admin code)', () => {
    authMock.register.mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid admin code' } }))
    );

    component.credentials = {
      name: 'Bad',
      email: 'bad@b.com',
      password: 'pw',
      adminKey: 'wrong',
    };
    component.onRegisterSubmit();

    expect(component.formError).toBe('Invalid admin code');
    expect(component.isSubmitting).toBe(false);
  });
});
