import { Routes } from '@angular/router';
import { autenticadoGuard, perfilGuard } from './core/guards';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  {
    path: '',
    loadComponent: () => import('./layout/shell').then(m => m.Shell),
    canActivate: [autenticadoGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'clientes', loadComponent: () => import('./pages/clientes/clientes').then(m => m.Clientes) },
      { path: 'clientes/:id', loadComponent: () => import('./pages/clientes/cliente-detalhe').then(m => m.ClienteDetalhe) },
      { path: 'leads', loadComponent: () => import('./pages/leads/leads').then(m => m.Leads) },
      { path: 'funil', loadComponent: () => import('./pages/funil/funil').then(m => m.Funil) },
      { path: 'tarefas', loadComponent: () => import('./pages/tarefas/tarefas').then(m => m.Tarefas) },
      {
        path: 'usuarios',
        canActivate: [perfilGuard('Admin')],
        loadComponent: () => import('./pages/usuarios/usuarios').then(m => m.Usuarios)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
