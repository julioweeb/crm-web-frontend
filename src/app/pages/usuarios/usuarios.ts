import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { PERFIS, ROTULO, Usuario } from '../../core/models';

interface FormUsuario { id?: number; nome: string; email: string; senha: string; perfil: string; ativo: boolean; }

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule],
  template: `
    <div class="cabecalho">
      <div>
        <h1>Usuários e permissões</h1>
        <p class="subtitulo">Vendedor vê só os próprios registros · Gerente vê tudo e pode excluir · Administrador gerencia usuários</p>
      </div>
      <button class="btn" (click)="novo()">+ Novo usuário</button>
    </div>

    @if (erro()) { <div class="msg-erro" role="alert">{{ erro() }}</div> }

    @if (editando(); as u) {
      <form class="cartao" style="margin-bottom:1rem" (ngSubmit)="salvar()" #f="ngForm">
        <h2>{{ u.id ? 'Editar usuário' : 'Novo usuário' }}</h2>
        <div class="form-grade">
          <div class="campo"><label for="u-n">Nome *</label><input id="u-n" name="nome" [(ngModel)]="u.nome" required maxlength="120"></div>
          <div class="campo"><label for="u-e">E-mail *</label><input id="u-e" name="email" type="email" [(ngModel)]="u.email" required></div>
          <div class="campo"><label for="u-s">{{ u.id ? 'Nova senha (opcional)' : 'Senha *' }}</label>
            <input id="u-s" name="senha" type="password" [(ngModel)]="u.senha" [required]="!u.id" minlength="8" autocomplete="new-password"></div>
          <div class="campo"><label for="u-p">Perfil</label>
            <select id="u-p" name="perfil" [(ngModel)]="u.perfil">
              @for (p of perfis; track p) { <option [value]="p">{{ rotulo[p] }}</option> }
            </select></div>
          <div class="campo"><label for="u-a">Situação</label>
            <select id="u-a" name="ativo" [(ngModel)]="u.ativo">
              <option [ngValue]="true">Ativo</option><option [ngValue]="false">Inativo</option>
            </select></div>
        </div>
        <div class="acoes">
          <button class="btn" type="submit" [disabled]="f.invalid">Salvar</button>
          <button class="btn btn-sec" type="button" (click)="editando.set(null)">Cancelar</button>
        </div>
      </form>
    }

    <div class="cartao tabela-wrap" style="padding:0">
      <table class="responsiva">
        <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Situação</th><th></th></tr></thead>
        <tbody>
          @for (u of itens(); track u.id) {
            <tr>
              <td data-rotulo="Nome"><strong>{{ u.nome }}</strong></td>
              <td data-rotulo="E-mail">{{ u.email }}</td>
              <td data-rotulo="Perfil"><span class="selo">{{ rotulo[u.perfil] }}</span></td>
              <td data-rotulo="Situação"><span class="selo" [class.verde]="u.ativo">{{ u.ativo ? 'Ativo' : 'Inativo' }}</span></td>
              <td class="acoes-cel"><button class="btn btn-sec btn-peq" (click)="editar(u)">Editar</button></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class Usuarios {
  private api = inject(ApiService);
  rotulo = ROTULO;
  perfis = PERFIS;
  itens = signal<Usuario[]>([]);
  editando = signal<FormUsuario | null>(null);
  erro = signal('');

  constructor() { this.carregar(); }

  carregar() {
    this.api.usuarios().subscribe({ next: r => this.itens.set(r), error: e => this.erro.set(ApiService.mensagemErro(e)) });
  }

  novo() { this.editando.set({ nome: '', email: '', senha: '', perfil: 'Vendedor', ativo: true }); }
  editar(u: Usuario) { this.editando.set({ id: u.id, nome: u.nome, email: u.email, senha: '', perfil: u.perfil, ativo: u.ativo }); }

  salvar() {
    const u = this.editando();
    if (!u) return;
    const corpo = { nome: u.nome, email: u.email, senha: u.senha, perfil: u.perfil, ativo: u.ativo };
    const req = u.id
      ? this.api.atualizarUsuario(u.id, { ...corpo, senha: u.senha || undefined })
      : this.api.criarUsuario(corpo);
    req.subscribe({
      next: () => { this.editando.set(null); this.erro.set(''); this.carregar(); },
      error: e => this.erro.set(ApiService.mensagemErro(e))
    });
  }
}
