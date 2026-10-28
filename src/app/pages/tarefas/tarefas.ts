import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Cliente, ROTULO, STATUS_TAREFA, Tarefa, TIPOS_TAREFA } from '../../core/models';

@Component({
  selector: 'app-tarefas',
  imports: [FormsModule, DatePipe],
  template: `
    <div class="cabecalho">
      <div>
        <h1>Tarefas e agenda</h1>
        <p class="subtitulo">Tarefas, ligações e reuniões agendadas com clientes</p>
      </div>
      <button class="btn" (click)="mostrarForm.set(!mostrarForm())">+ Nova tarefa / agendamento</button>
    </div>

    @if (erro()) { <div class="msg-erro" role="alert">{{ erro() }}</div> }

    @if (mostrarForm()) {
      <form class="cartao" style="margin-bottom:1rem" (ngSubmit)="salvar()" #f="ngForm">
        <div class="form-grade">
          <div class="campo"><label for="t-t">Título *</label><input id="t-t" name="titulo" [(ngModel)]="nova.titulo" required maxlength="160"></div>
          <div class="campo"><label for="t-tipo">Tipo</label>
            <select id="t-tipo" name="tipo" [(ngModel)]="nova.tipo">
              @for (t of tipos; track t) { <option [value]="t">{{ rotulo[t] }}</option> }
            </select></div>
          <div class="campo"><label for="t-d">Data e hora *</label><input id="t-d" name="data" type="datetime-local" [(ngModel)]="nova.data" required></div>
          <div class="campo"><label for="t-c">Cliente</label>
            <select id="t-c" name="cliente" [(ngModel)]="nova.clienteId">
              <option [ngValue]="null">— nenhum —</option>
              @for (c of clientes(); track c.id) { <option [ngValue]="c.id">{{ c.nome }}</option> }
            </select></div>
        </div>
        <div class="campo"><label for="t-ds">Descrição</label><textarea id="t-ds" name="desc" [(ngModel)]="nova.descricao" maxlength="1000"></textarea></div>
        <div class="acoes">
          <button class="btn" type="submit" [disabled]="f.invalid">Salvar</button>
          <button class="btn btn-sec" type="button" (click)="mostrarForm.set(false)">Cancelar</button>
        </div>
      </form>
    }

    <div class="filtros">
      <div class="campo"><label for="f-s">Status</label>
        <select id="f-s" [(ngModel)]="status" (change)="carregar()">
          <option value="">Todos</option>
          @for (s of statusLista; track s) { <option [value]="s">{{ rotulo[s] }}</option> }
        </select></div>
      <div class="campo"><label for="f-a">Mostrar</label>
        <select id="f-a" [(ngModel)]="atrasadas" (change)="carregar()">
          <option value="">Todas</option><option value="true">Somente atrasadas</option>
        </select></div>
    </div>

    <div class="cartao tabela-wrap" style="padding:0">
      <table class="responsiva">
        <thead><tr><th>Quando</th><th>Título</th><th>Tipo</th><th>Status</th><th></th></tr></thead>
        <tbody>
          @for (t of itens(); track t.id) {
            <tr>
              <td data-rotulo="Quando">{{ t.dataVencimento | date:'dd/MM/yyyy HH:mm' }}
                @if (atrasada(t)) { <span class="selo vermelho">Atrasada</span> }</td>
              <td data-rotulo="Título"><strong>{{ t.titulo }}</strong>@if (t.descricao) { <div class="subtitulo">{{ t.descricao }}</div> }</td>
              <td data-rotulo="Tipo"><span class="selo">{{ rotulo[t.tipo] }}</span></td>
              <td data-rotulo="Status"><span class="selo" [class.verde]="t.status === 'Concluida'">{{ rotulo[t.status] }}</span></td>
              <td class="acoes-cel">
                @if (t.status !== 'Concluida') { <button class="btn btn-peq" (click)="concluir(t)">Concluir</button> }
                <button class="btn btn-perigo btn-peq" style="margin-left:.3rem" (click)="excluir(t)">Excluir</button>
              </td>
            </tr>
          } @empty { <tr><td colspan="5" class="vazio">Nenhuma tarefa encontrada.</td></tr> }
        </tbody>
      </table>
    </div>
  `
})
export class Tarefas {
  private api = inject(ApiService);
  rotulo = ROTULO;
  tipos = TIPOS_TAREFA;
  statusLista = STATUS_TAREFA;

  itens = signal<Tarefa[]>([]);
  clientes = signal<Cliente[]>([]);
  mostrarForm = signal(false);
  erro = signal('');
  status = '';
  atrasadas = '';
  nova = this.vazia();

  constructor() {
    this.carregar();
    this.api.clientes({ tamanho: 100 }).subscribe({ next: r => this.clientes.set(r.itens) });
  }

  private vazia() {
    return { titulo: '', tipo: 'Tarefa', data: '', clienteId: null as number | null, descricao: '' };
  }

  atrasada(t: Tarefa) { return t.status !== 'Concluida' && new Date(t.dataVencimento) < new Date(); }

  carregar() {
    this.api.tarefas({ status: this.status, atrasadas: this.atrasadas, tamanho: 100 }).subscribe({
      next: r => { this.itens.set(r.itens); this.erro.set(''); },
      error: e => this.erro.set(ApiService.mensagemErro(e))
    });
  }

  salvar() {
    this.api.criarTarefa({
      titulo: this.nova.titulo, tipo: this.nova.tipo as never, descricao: this.nova.descricao || null,
      // datetime-local vem sem fuso; new Date(...) interpreta no horário local do navegador.
      dataVencimento: new Date(this.nova.data).toISOString(), status: 'Pendente',
      clienteId: this.nova.clienteId
    }).subscribe({
      next: () => { this.nova = this.vazia(); this.mostrarForm.set(false); this.carregar(); },
      error: e => this.erro.set(ApiService.mensagemErro(e))
    });
  }

  concluir(t: Tarefa) {
    this.api.concluirTarefa(t.id).subscribe({ next: () => this.carregar(), error: e => this.erro.set(ApiService.mensagemErro(e)) });
  }

  excluir(t: Tarefa) {
    if (!confirm(`Excluir "${t.titulo}"?`)) return;
    this.api.excluirTarefa(t.id).subscribe({ next: () => this.carregar(), error: e => this.erro.set(ApiService.mensagemErro(e)) });
  }
}
