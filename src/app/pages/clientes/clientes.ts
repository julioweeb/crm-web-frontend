import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Cliente } from '../../core/models';

@Component({
  selector: 'app-clientes',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="cabecalho">
      <div>
        <h1>Clientes</h1>
        <p class="subtitulo">{{ total() }} cliente(s) encontrado(s)</p>
      </div>
      <button class="btn" (click)="novo()">+ Novo cliente</button>
    </div>

    @if (erro()) { <div class="msg-erro" role="alert">{{ erro() }}</div> }

    @if (editando(); as c) {
      <form class="cartao" style="margin-bottom:1rem" (ngSubmit)="salvar()" #f="ngForm">
        <h2>{{ c.id ? 'Editar cliente' : 'Novo cliente' }}</h2>
        <div class="form-grade">
          <div class="campo"><label for="c-nome">Nome *</label>
            <input id="c-nome" name="nome" [(ngModel)]="c.nome" required maxlength="160"></div>
          <div class="campo"><label for="c-doc">CPF/CNPJ</label>
            <input id="c-doc" name="documento" [(ngModel)]="c.documento" maxlength="20"></div>
          <div class="campo"><label for="c-email">E-mail</label>
            <input id="c-email" name="email" type="email" [(ngModel)]="c.email" maxlength="160"></div>
          <div class="campo"><label for="c-tel">Telefone</label>
            <input id="c-tel" name="telefone" [(ngModel)]="c.telefone" maxlength="30"></div>
          <div class="campo"><label for="c-emp">Empresa</label>
            <input id="c-emp" name="empresa" [(ngModel)]="c.empresa" maxlength="160"></div>
          <div class="campo"><label for="c-end">Endereço</label>
            <input id="c-end" name="endereco" [(ngModel)]="c.endereco" maxlength="200"></div>
          <div class="campo"><label for="c-cid">Cidade</label>
            <input id="c-cid" name="cidade" [(ngModel)]="c.cidade" maxlength="80"></div>
          <div class="campo"><label for="c-uf">UF</label>
            <input id="c-uf" name="estado" [(ngModel)]="c.estado" maxlength="2"></div>
          <div class="campo"><label for="c-ativo">Situação</label>
            <select id="c-ativo" name="ativo" [(ngModel)]="c.ativo">
              <option [ngValue]="true">Ativo</option><option [ngValue]="false">Inativo</option>
            </select></div>
        </div>
        <div class="acoes">
          <button class="btn" type="submit" [disabled]="f.invalid || salvando()">Salvar</button>
          <button class="btn btn-sec" type="button" (click)="editando.set(null)">Cancelar</button>
        </div>
      </form>
    }

    <div class="filtros">
      <div class="campo"><label for="busca">Buscar</label>
        <input id="busca" [(ngModel)]="busca" (keyup.enter)="buscar()" placeholder="Nome, e-mail, empresa ou documento"></div>
      <div class="campo"><label for="f-cidade">Cidade</label>
        <input id="f-cidade" [(ngModel)]="cidade" (keyup.enter)="buscar()"></div>
      <div class="campo"><label for="f-sit">Situação</label>
        <select id="f-sit" [(ngModel)]="situacao" (change)="buscar()">
          <option value="">Todas</option><option value="true">Ativos</option><option value="false">Inativos</option>
        </select></div>
      <button class="btn" style="flex:0 0 auto" (click)="buscar()">Filtrar</button>
    </div>

    <div class="cartao tabela-wrap" style="padding:0">
      <table class="responsiva">
        <thead><tr><th>Nome</th><th>Empresa</th><th>E-mail</th><th>Telefone</th><th>Cidade</th><th>Situação</th><th></th></tr></thead>
        <tbody>
          @for (c of itens(); track c.id) {
            <tr>
              <td data-rotulo="Nome"><a [routerLink]="['/clientes', c.id]"><strong>{{ c.nome }}</strong></a></td>
              <td data-rotulo="Empresa">{{ c.empresa }}</td>
              <td data-rotulo="E-mail">{{ c.email }}</td>
              <td data-rotulo="Telefone">{{ c.telefone }}</td>
              <td data-rotulo="Cidade">{{ c.cidade }}{{ c.estado ? '/' + c.estado : '' }}</td>
              <td data-rotulo="Situação"><span class="selo" [class.verde]="c.ativo">{{ c.ativo ? 'Ativo' : 'Inativo' }}</span></td>
              <td class="acoes-cel">
                <button class="btn btn-sec btn-peq" (click)="editar(c)">Editar</button>
                @if (auth.temPerfil('Admin', 'Gerente')) {
                  <button class="btn btn-perigo btn-peq" style="margin-left:.3rem" (click)="excluir(c)">Excluir</button>
                }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="7" class="vazio">Nenhum cliente encontrado.</td></tr>
          }
        </tbody>
      </table>
    </div>

    <div class="paginacao">
      <span>Página {{ pagina() }} de {{ totalPaginas() }}</span>
      <span>
        <button class="btn btn-sec btn-peq" [disabled]="pagina() <= 1" (click)="irPara(pagina() - 1)">Anterior</button>
        <button class="btn btn-sec btn-peq" [disabled]="pagina() >= totalPaginas()" (click)="irPara(pagina() + 1)">Próxima</button>
      </span>
    </div>
  `
})
export class Clientes {
  private api = inject(ApiService);
  auth = inject(AuthService);

  itens = signal<Cliente[]>([]);
  total = signal(0);
  pagina = signal(1);
  readonly tamanho = 10;
  totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.tamanho)));
  editando = signal<Partial<Cliente> | null>(null);
  salvando = signal(false);
  erro = signal('');

  busca = '';
  cidade = '';
  situacao = '';

  constructor() { this.carregar(); }

  buscar() { this.pagina.set(1); this.carregar(); }
  irPara(p: number) { this.pagina.set(p); this.carregar(); }

  carregar() {
    this.api.clientes({
      busca: this.busca, cidade: this.cidade, ativo: this.situacao,
      pagina: this.pagina(), tamanho: this.tamanho
    }).subscribe({
      next: r => { this.itens.set(r.itens); this.total.set(r.total); this.erro.set(''); },
      error: e => this.erro.set(ApiService.mensagemErro(e))
    });
  }

  novo() { this.editando.set({ nome: '', ativo: true }); }
  editar(c: Cliente) { this.editando.set({ ...c }); }

  salvar() {
    const c = this.editando();
    if (!c) return;
    this.salvando.set(true);
    const req = c.id ? this.api.atualizarCliente(c.id, c) : this.api.criarCliente(c);
    req.subscribe({
      next: () => { this.salvando.set(false); this.editando.set(null); this.carregar(); },
      error: e => { this.salvando.set(false); this.erro.set(ApiService.mensagemErro(e)); }
    });
  }

  excluir(c: Cliente) {
    if (!confirm(`Excluir o cliente "${c.nome}"? Contatos e oportunidades dele também serão removidos.`)) return;
    this.api.excluirCliente(c.id).subscribe({
      next: () => this.carregar(),
      error: e => this.erro.set(ApiService.mensagemErro(e))
    });
  }
}
