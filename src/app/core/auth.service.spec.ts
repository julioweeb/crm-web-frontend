import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { API_URL } from './config';

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  it('começa deslogado', () => {
    expect(auth.logado()).toBe(false);
  });

  it('guarda token e usuário após o login', () => {
    auth.login('a@a.com', 'Senha123').subscribe();
    http.expectOne(`${API_URL}/auth/login`).flush({
      token: 'abc', expiraEm: '2030-01-01',
      usuario: { id: 1, nome: 'Ana', email: 'a@a.com', perfil: 'Gerente', ativo: true }
    });
    expect(auth.logado()).toBe(true);
    expect(auth.token).toBe('abc');
    expect(auth.temPerfil('Gerente')).toBe(true);
    expect(auth.temPerfil('Admin')).toBe(false);
  });
});
