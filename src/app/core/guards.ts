import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Perfil } from './models';

export const autenticadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.logado() ? true : inject(Router).createUrlTree(['/login']);
};

// Uso: canActivate: [perfilGuard('Admin', 'Gerente')]
export const perfilGuard = (...perfis: Perfil[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  return auth.temPerfil(...perfis) ? true : inject(Router).createUrlTree(['/dashboard']);
};
