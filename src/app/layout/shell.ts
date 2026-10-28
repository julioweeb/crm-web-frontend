import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ROTULO } from '../core/models';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <button class="btn-icone" (click)="menuAberto.set(!menuAberto())" aria-label="Abrir menu">☰</button>
      <strong>CRM</strong>
    </header>

    <aside class="sidebar" [class.aberto]="menuAberto()">
      <div class="marca">CRM</div>
      <nav (click)="menuAberto.set(false)">
        <a routerLink="/dashboard" routerLinkActive="ativo">Dashboard</a>
        <a routerLink="/clientes" routerLinkActive="ativo">Clientes</a>
        <a routerLink="/leads" routerLinkActive="ativo">Leads</a>
        <a routerLink="/funil" routerLinkActive="ativo">Funil de vendas</a>
        <a routerLink="/tarefas" routerLinkActive="ativo">Tarefas e agenda</a>
        @if (auth.temPerfil('Admin')) {
          <a routerLink="/usuarios" routerLinkActive="ativo">Usuários</a>
        }
      </nav>
      <div class="usuario">
        <div class="nome">{{ auth.usuario()?.nome }}</div>
        <div class="perfil">{{ rotulo[auth.usuario()?.perfil ?? ''] }}</div>
        <button class="btn btn-sec" (click)="auth.sair()">Sair</button>
      </div>
    </aside>

    @if (menuAberto()) {
      <div class="fundo-menu" (click)="menuAberto.set(false)"></div>
    }

    <main class="conteudo">
      <router-outlet />
    </main>
  `
})
export class Shell {
  auth = inject(AuthService);
  rotulo = ROTULO;
  menuAberto = signal(false);
}
