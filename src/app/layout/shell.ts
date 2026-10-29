import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { InstalarService } from '../core/instalar.service';
import { ROTULO } from '../core/models';
import { TemaService } from '../core/tema.service';

interface ItemMenu { rota: string; texto: string; icone: string; so?: 'Admin'; }

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <button class="btn-icone" (click)="menuAberto.set(!menuAberto())" aria-label="Abrir menu">☰</button>
      <svg viewBox="0 0 32 32" aria-hidden="true"><use href="#logo" /></svg>
      CRM
    </header>

    <!-- Símbolo do funil: barras que estreitam, nas cores dos estágios -->
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <symbol id="logo" viewBox="0 0 32 32">
        <rect x="2" y="4" width="28" height="5" rx="2.5" fill="#8fa6b8" />
        <rect x="6" y="12" width="20" height="5" rx="2.5" style="fill: var(--logo-2)" />
        <rect x="10" y="20" width="12" height="5" rx="2.5" style="fill: var(--logo-3)" />
        <rect x="13" y="28" width="6" height="3" rx="1.5" fill="#3fa66b" />
      </symbol>
    </svg>

    <aside class="sidebar" [class.aberto]="menuAberto()">
      <div class="marca"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="#logo" /></svg>CRM</div>

      <nav (click)="menuAberto.set(false)" aria-label="Principal">
        @for (item of itens(); track item.rota) {
          <a [routerLink]="item.rota" routerLinkActive="ativo">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="item.icone" /></svg>
            {{ item.texto }}
          </a>
        }
      </nav>

      @if (instalar.disponivel()) {
        <button class="btn-instalar" (click)="instalar.instalar()">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
          Instalar app
        </button>
      }

      <div class="usuario">
        <div class="avatar" aria-hidden="true">{{ inicial() }}</div>
        <div class="quem">
          <div class="nome">{{ auth.usuario()?.nome }}</div>
          <div class="perfil">{{ rotulo[auth.usuario()?.perfil ?? ''] }}</div>
        </div>
        <button class="btn-tema" (click)="tema.alternar()"
                [attr.aria-label]="tema.tema() === 'escuro' ? 'Usar tema claro' : 'Usar tema escuro'"
                [title]="tema.tema() === 'escuro' ? 'Tema claro' : 'Tema escuro'">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            @if (tema.tema() === 'escuro') {
              <path d="M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
            } @else {
              <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
            }
          </svg>
        </button>
        <button class="btn-sair" (click)="auth.sair()" aria-label="Sair" title="Sair">
          <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
        </button>
      </div>
    </aside>

    @if (menuAberto()) {
      <div class="fundo-menu" (click)="menuAberto.set(false)"></div>
    }

    <main class="conteudo">
      <div class="pagina">
        <router-outlet />
      </div>
    </main>
  `
})
export class Shell {
  auth = inject(AuthService);
  tema = inject(TemaService);
  instalar = inject(InstalarService);
  rotulo = ROTULO;
  menuAberto = signal(false);

  private todos: ItemMenu[] = [
    { rota: '/dashboard', texto: 'Dashboard', icone: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z' },
    { rota: '/clientes', texto: 'Clientes', icone: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
    { rota: '/leads', texto: 'Leads', icone: 'M22 12h-6l-2 3h-4l-2-3H2M5.5 5.1L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.5-6.9A2 2 0 0016.8 4H7.2a2 2 0 00-1.7 1.1z' },
    { rota: '/funil', texto: 'Funil de vendas', icone: 'M22 3H2l8 9.5V19l4 2v-8.5z' },
    { rota: '/tarefas', texto: 'Tarefas e agenda', icone: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z' },
    { rota: '/usuarios', texto: 'Usuários', icone: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', so: 'Admin' }
  ];

  itens = computed(() => this.todos.filter(i => !i.so || this.auth.temPerfil(i.so)));
  inicial = computed(() => (this.auth.usuario()?.nome ?? '?').trim().charAt(0).toUpperCase());
}
