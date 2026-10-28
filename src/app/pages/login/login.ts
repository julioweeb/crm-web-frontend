import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  styles: [`
    .tela { min-height: 100vh; display: grid; place-items: center; padding: 1rem; }
    .caixa { width: 100%; max-width: 400px; }
    .link { background: none; border: 0; color: var(--primaria); cursor: pointer; font: inherit; padding: 0; }
  `],
  template: `
    <div class="tela">
      <form class="cartao caixa" (ngSubmit)="enviar()" #f="ngForm">
        <h1>CRM</h1>
        <p class="subtitulo" style="margin-bottom:1rem">
          {{ modoCadastro() ? 'Crie sua conta' : 'Entre para continuar' }}
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
            <small class="subtitulo">Mínimo de 8 caracteres, com letras e números.</small>
          }
        </div>

        <button class="btn" style="width:100%" type="submit" [disabled]="carregando() || f.invalid">
          {{ carregando() ? 'Aguarde...' : (modoCadastro() ? 'Cadastrar' : 'Entrar') }}
        </button>

        <p style="text-align:center; margin-top:1rem">
          <button type="button" class="link" (click)="alternar()">
            {{ modoCadastro() ? 'Já tenho conta' : 'Criar uma conta' }}
          </button>
        </p>
      </form>
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
