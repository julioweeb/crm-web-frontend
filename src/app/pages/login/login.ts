import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  styles: [`
    .tela { min-height: 100vh; display: grid; grid-template-columns: minmax(320px, 5fr) 6fr; }
    .lado {
      background: var(--brand-ink); color: #e8f3f3; padding: 3rem; display: flex; flex-direction: column; justify-content: space-between;
    }
    .lado .nome { font-family: var(--fonte-titulo); font-weight: 700; font-size: 1.4rem; display: flex; align-items: center; gap: .6rem; }
    .lado .nome svg { width: 32px; height: 32px; }
    .lado h2 { font-size: 2.3rem; line-height: 1.1; max-width: 14ch; color: #fff; margin: 0 0 1rem; }
    .lado p { max-width: 34ch; color: #b9d4d6; margin: 0; }

    /* O funil, desenhado com as cores dos estágios */
    .funil { display: flex; flex-direction: column; gap: 8px; margin: 2.5rem 0; }
    .funil div { height: 14px; border-radius: 7px; }
    .funil div:nth-child(1) { width: 100%; background: var(--st-prospeccao); }
    .funil div:nth-child(2) { width: 78%; background: var(--st-qualificacao); }
    .funil div:nth-child(3) { width: 56%; background: #4aa6a8; }
    .funil div:nth-child(4) { width: 36%; background: var(--st-ganha); }

    .form-lado { display: grid; place-items: center; padding: 2rem 1.25rem; }
    .caixa { width: 100%; max-width: 380px; }
    .caixa h1 { margin-bottom: .4rem; }
    .link { background: none; border: 0; color: var(--brand); cursor: pointer; font: inherit; font-weight: 600; padding: 0; }
    .link:hover { text-decoration: underline; }
    .dica { font-size: .82rem; color: var(--ink-3); }

    @media (max-width: 820px) {
      .tela { grid-template-columns: 1fr; }
      .lado { padding: 1.5rem; flex-direction: row; align-items: center; }
      .lado h2, .lado p, .funil { display: none; }
    }
  `],
  template: `
    <div class="tela">
      <section class="lado">
        <div class="nome">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <rect x="2" y="4" width="28" height="5" rx="2.5" fill="#8fa6b8" />
            <rect x="6" y="12" width="20" height="5" rx="2.5" fill="#4aa6a8" />
            <rect x="10" y="20" width="12" height="5" rx="2.5" fill="#3fa66b" />
          </svg>
          CRM
        </div>
        <div>
          <div class="funil" aria-hidden="true"><div></div><div></div><div></div><div></div></div>
          <h2>Cada negociação no seu lugar.</h2>
          <p>Clientes, leads e oportunidades em um só sistema, do primeiro contato ao fechamento.</p>
        </div>
        <span></span>
      </section>

      <section class="form-lado">
        <form class="caixa" (ngSubmit)="enviar()" #f="ngForm">
          <h1>{{ modoCadastro() ? 'Criar conta' : 'Entrar' }}</h1>
          <p class="subtitulo" style="margin-bottom:1.5rem">
            {{ modoCadastro() ? 'Preencha seus dados para começar.' : 'Use seu e-mail e senha para acessar.' }}
          </p>

          @if (erro()) { <div class="msg-erro" role="alert">{{ erro() }}</div> }

          @if (modoCadastro()) {
            <div class="campo">
              <label for="nome">Nome</label>
              <input id="nome" name="nome" [(ngModel)]="nome" required maxlength="120" autocomplete="name">
            </div>
          }
          <div class="campo">
            <label for="email">E-mail</label>
            <input id="email" name="email" type="email" [(ngModel)]="email" required autocomplete="username">
          </div>
          <div class="campo">
            <label for="senha">Senha</label>
            <input id="senha" name="senha" type="password" [(ngModel)]="senha" required
                   [minlength]="modoCadastro() ? 8 : 1"
                   [autocomplete]="modoCadastro() ? 'new-password' : 'current-password'">
            @if (modoCadastro()) {
              <span class="dica">Mínimo de 8 caracteres, com letras e números.</span>
            }
          </div>

          <button class="btn" style="width:100%; padding:.7rem" type="submit" [disabled]="carregando() || f.invalid">
            {{ carregando() ? 'Aguarde...' : (modoCadastro() ? 'Criar conta' : 'Entrar') }}
          </button>

          <p style="text-align:center; margin-top:1.25rem">
            {{ modoCadastro() ? 'Já tem conta?' : 'Ainda não tem conta?' }}
            <button type="button" class="link" (click)="alternar()">{{ modoCadastro() ? 'Entrar' : 'Criar conta' }}</button>
          </p>
        </form>
      </section>
    </div>
  `
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  nome = '';
  email = '';
  senha = '';
  modoCadastro = signal(false);
  carregando = signal(false);
  erro = signal('');

  alternar() { this.modoCadastro.update(v => !v); this.erro.set(''); }

  enviar() {
    this.erro.set('');
    this.carregando.set(true);
    const req = this.modoCadastro()
      ? this.auth.registrar(this.nome, this.email, this.senha)
      : this.auth.login(this.email, this.senha);

    req.subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: e => { this.erro.set(ApiService.mensagemErro(e)); this.carregando.set(false); }
    });
  }
}
