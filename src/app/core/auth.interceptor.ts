import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { API_URL } from './config';

// Anexa o token JWT em toda chamada à API e desloga se o token expirar (401).
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  const requisicao = token && req.url.startsWith(API_URL)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requisicao).pipe(
    catchError((erro: HttpErrorResponse) => {
      const ehLogin = req.url.includes('/auth/login') || req.url.includes('/auth/registro');
      if (erro.status === 401 && !ehLogin) auth.sair();
      return throwError(() => erro);
    })
  );
};
