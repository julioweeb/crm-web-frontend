import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Lead, ROTULO, STATUS_LEAD } from '../../core/models';

@Component({
  selector: 'app-leads',
  imports: [FormsModule, DatePipe],
  template: `
    <div class="cabecalho">
      <div>
        <h1>Leads</h1>
        <p class="subtitulo">{{ total() }} lead(s) — potenciais clientes ainda em qualificação</p>
      </div>
      <button class="btn" (click)="novo()">+ Novo lead</button>
    </div>

    @if (erro()) { <div class="msg-erro" role="alert">{{ erro() }}</div> }
    @if (ok()) { <div class="msg-ok">{{ ok() }}</div> }

    @if (editando(); as l) {
      <form class="cartao" style="margin-bottom:1rem" (ngSubmit)="salvar()" #f="ngForm">
        <h2>{{ l.id ? 'Editar lead' : 'Novo lead' }}</h2>
        <div class="form-grade">
          <div class="campo"><label for="l-n">Nome *</label><input id="l-n" name="nome" [(ngModel)]="l.nome" required maxlength="160"></div>
          <div class="campo"><label for="l-e">E-mail</label><input id="l-e" name="email" type="email" [(ngModel)]="l.email"></div>
          <div class="campo"><label for="l-t">Telefone</label><input id="l-t" name="tel" [(ngModel)]="l.telefone"></div>
          <div class="campo"><label for="l-emp">Empresa</label><input id="l-emp" name="emp" [(ngModel)]="l.empresa"></div>
          <div class="campo"><label for="l-o">Origem</label><input id="l-o" name="origem" [(ngModel)]="l.origem" placeholder="Site, indicação, evento..."></div>
          @if (l.id) {
            <div class="campo"><label for="l-s">Status</label>
              <select id="l-s" name="status" [(ngModel)]="l.status">
                @for (s of statusLista; track s) { <option [value]="s">{{ rotulo[s] }}</option> }
              </select></div>
          }
        </div>
        <div class="acoes">
          <button class="btn" type="submit" [disabled]="f.invalid">Salvar</button>
          <button class="btn btn-sec" type="button" (click)="editando.set(null)">Cancelar</button>
        </div>
      </form>
    }

    <div class="filtros">
      <div class="campo"><label for="lb">Buscar</label>
        <input id="lb" [(ngModel)]="busca" (keyup.enter)="carregar()" placeholder="Nome, e-mail ou empresa"></div>
      <div class="campo"><label for="ls">Status</label>
        <select id="ls" [(ngModel)]="status" (change)="carregar()">
          <option value="">Todos</option>
          @for (s of statusLista; track s) { <option [value]="s">{{ rotulo[s] }}</option> }
          <option value="Convertido">Convertido</option>
        </select></div>
      <button class="btn" style="flex:0 0 auto" (click)="carregar()">Filtrar</button>
    </div>

    <div class="cartao tabela-wrap" style="padding:0">
      <table class="responsiva">
        <thead><tr><th>Nome</th><th>Empresa</th><th>Contato</th><th>Origem</th><th>Status</th><th>Criado em</th><th></th></tr></thead>
        <tbody>
          @for (l of itens(); track l.id) {
            <tr>
              <td data-rotulo="Nome"><strong>{{ l.nome }}</strong></td>
              <td data-rotulo="Empresa">{{ l.empresa }}</td>
              <td data-rotulo="Contato">{{ l.email || l.telefone }}</td>
              <td data-rotulo="Origem">{{ l.origem }}</td>
              <td data-rotulo="Status">
                <span class="selo" [class.verde]="l.status === 'Convertido'" [class.vermelho]="l.status === 'Desqualificado'">{{ rotulo[l.status] }}</span>
              </td>
              <td data-rotulo="Criado em">{{ l.criadoEm | date:'dd/MM/yyyy' }}</td>
              <td class="acoes-cel">
                @if (l.status !== 'Convertido') {
                  <button class="btn btn-peq" (click)="converter(l)">Converter</button>
                  <button class="btn btn-sec btn-peq" style="margin-left:.3rem" (click)="editar(l)">Editar</button>
                }
                <button class="btn btn-perigo btn-peq" style="margin-left:.3rem" (click)="excluir(l)">Excluir</button>
              </td>
            </tr>
          } @empty { <tr><td colspan="7" class="vazio">Nenhum lead encontrado.</td></tr> }
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
export class Leads {
  private api = inject(ApiService);
  rotulo = ROTULO;
  statusLista = STATUS_LEAD;

  itens = signal<Lead[]>([]);
  total = signal(0);
  pagina = signal(1);
  readonly tamanho = 10;
  totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.tamanho)));
  editando = signal<Partial<Lead> | null>(null);
  erro = signal('');
  ok = signal('');
  busca = '';
  status = '';

  constructor() { this.carregar(); }

  irPara(p: number) { this.pagina.set(p); this.carregarPagina(); }
  carregar() { this.pagina.set(1); this.carregarPagina(); }

  private carregarPagina() {
    this.api.leads({ busca: this.busca, status: this.status, pagina: this.pagina(), tamanho: this.tamanho }).subscribe({
      next: r => { this.itens.set(r.itens); this.total.set(r.total); this.erro.set(''); },
      error: e => this.erro.set(ApiService.mensagemErro(e))
    });
  }

  novo() { this.editando.set({ nome: '', status: 'Novo' }); }
  editar(l: Lead) { this.editando.set({ ...l }); }

  salvar() {
    const l = this.editando();
    if (!l) return;
    const req = l.id ? this.api.atualizarLead(l.id, l) : this.api.criarLead(l);
    req.subscribe({
      next: () => { this.editando.set(null); this.carregarPagina(); },
      error: e => this.erro.set(ApiService.mensagemErro(e))
    });
  }

  converter(l: Lead) {
    if (!confirm(`Converter "${l.nome}" em cliente? Uma oportunidade será criada no funil.`)) return;
    this.api.converterLead(l.id).subscribe({
      next: c => { this.ok.set(`"${c.nome}" agora é um cliente.`); setTimeout(() => this.ok.set(''), 4000); this.carregarPagina(); },
      error: e => this.erro.set(ApiService.mensagemErro(e))
    });
  }

  excluir(l: Lead) {
    if (!confirm(`Excluir o lead "${l.nome}"?`)) return;
    this.api.excluirLead(l.id).subscribe({ next: () => this.carregarPagina(), error: e => this.erro.set(ApiService.mensagemErro(e)) });
  }
}
