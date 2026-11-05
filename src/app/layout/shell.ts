import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { InstalarService } from '../core/instalar.service';
import { Perfil, ROTULO } from '../core/models';
import { TemaService } from '../core/tema.service';

interface ItemMenu {
  rota: string;
  texto: string;
  icone: string;
  so?: Perfil[];
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  auth = inject(AuthService);
  tema = inject(TemaService);
  instalar = inject(InstalarService);
  rotulo = ROTULO;
  menuAberto = signal(false);

  private todos: ItemMenu[] = [
    {
      rota: '/dashboard',
      texto: 'Dashboard',
      icone: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    },
    {
      rota: '/clientes',
      texto: 'Clientes',
      icone:
        'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
    },
    {
      rota: '/leads',
      texto: 'Leads',
      icone:
        'M22 12h-6l-2 3h-4l-2-3H2M5.5 5.1L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.5-6.9A2 2 0 0016.8 4H7.2a2 2 0 00-1.7 1.1z',
    },
    { rota: '/funil', texto: 'Funil de vendas', icone: 'M22 3H2l8 9.5V19l4 2v-8.5z' },
    {
      rota: '/tarefas',
      texto: 'Tarefas e agenda',
      icone:
        'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
    },
    {
      rota: '/usuarios',
      texto: 'Usuários',
      icone: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
      so: ['Admin', 'SuperAdmin'],
    },
    {
      rota: '/empresas',
      texto: 'Empresas',
      icone: 'M3 21h18M5 21V7l8-4 8 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-5 8v-4h4v4',
      so: ['SuperAdmin'],
    },
  ];

  itens = computed(() => this.todos.filter((i) => !i.so || this.auth.temPerfil(...i.so!)));
  inicial = computed(() => (this.auth.usuario()?.nome ?? '?').trim().charAt(0).toUpperCase());
}
