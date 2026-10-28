import { Component, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import {
  Anotacao, Cliente, Contato, ESTAGIOS, Interacao, ROTULO, TIPOS_INTERACAO, TipoInteracao
} from '../../core/models';

type Aba = 'contatos' | 'historico' | 'anotacoes' | 'oportunidade';

@Component({
  selector: 'app-cliente-detalhe',
  imports: [FormsModule, RouterLink, DatePipe],
  template: `
    <p><a routerLink="/clientes">← Voltar para clientes</a></p>

    @if (erro()) { <div class="msg-erro" role="alert">{{ erro() }}</div> }
    @if (ok()) { <div class="msg-ok">{{ ok() }}</div> }

    @if (cliente(); as c) {
      <div class="cartao" style="margin-bottom:1rem">
        <h1>{{ c.nome }}</h1>
        <p class="subtitulo">{{ c.empresa }}</p>
        <div class="form-grade" style="margin-top:.75rem">
          <div><label>E-mail</label>{{ c.email || '—' }}</div>
          <div><label>Telefone</label>{{ c.telefone || '—' }}</div>
          <div><label>Documento</label>{{ c.documento || '—' }}</div>
          <div><label>Cidade</label>{{ c.cidade || '—' }}{{ c.estado ? '/' + c.estado : '' }}</div>
        </div>
      </div>

      <div class="abas" role="tablist">
        <button [class.ativa]="aba() === 'contatos'" (click)="aba.set('contatos')">Contatos</button>
        <button [class.ativa]="aba() === 'historico'" (click)="aba.set('historico')">Histórico de interações</button>
        <button [class.ativa]="aba() === 'anotacoes'" (click)="aba.set('anotacoes')">Anotações</button>
        <button [class.ativa]="aba() === 'oportunidade'" (click)="aba.set('oportunidade')">Nova oportunidade</button>
      </div>

      @switch (aba()) {
        @case ('contatos') {
          <form class="cartao" style="margin-bottom:1rem" (ngSubmit)="addContato()" #fc="ngForm">
            <div class="form-grade">
              <div class="campo"><label for="ct-n">Nome *</label><input id="ct-n" name="n" [(ngModel)]="novoContato.nome" required maxlength="120"></div>
              <div class="campo"><label for="ct-c">Cargo</label><input id="ct-c" name="c" [(ngModel)]="novoContato.cargo" maxlength="80"></div>
              <div class="campo"><label for="ct-e">E-mail</label><input id="ct-e" name="e" type="email" [(ngModel)]="novoContato.email"></div>
              <div class="campo"><label for="ct-t">Telefone</label><input id="ct-t" name="t" [(ngModel)]="novoContato.telefone"></div>
            </div>
            <button class="btn" type="submit" [disabled]="fc.invalid">Adicionar contato</button>
          </form>
          <div class="cartao tabela-wrap" style="padding:0">
            <table class="responsiva">
              <thead><tr><th>Nome</th><th>Cargo</th><th>E-mail</th><th>Telefone</th><th></th></tr></thead>
              <tbody>
                @for (ct of contatos(); track ct.id) {
                  <tr>
                    <td data-rotulo="Nome"><strong>{{ ct.nome }}</strong></td>
                    <td data-rotulo="Cargo">{{ ct.cargo }}</td>
                    <td data-rotulo="E-mail">{{ ct.email }}</td>
                    <td data-rotulo="Telefone">{{ ct.telefone }}</td>
                    <td class="acoes-cel"><button class="btn btn-perigo btn-peq" (click)="delContato(ct)">Excluir</button></td>
                  </tr>
                } @empty { <tr><td colspan="5" class="vazio">Nenhum contato cadastrado.</td></tr> }
              </tbody>
            </table>
          </div>
        }

        @case ('historico') {
          <form class="cartao" style="margin-bottom:1rem" (ngSubmit)="addInteracao()" #fi="ngForm">
            <div class="form-grade">
              <div class="campo"><label for="i-t">Tipo</label>
                <select id="i-t" name="t" [(ngModel)]="novaInteracao.tipo">
                  @for (t of tipos; track t) { <option [value]="t">{{ rotulo[t] }}</option> }
                </select></div>
              @if (contatos().length) {
                <div class="campo"><label for="i-c">Contato</label>
                  <select id="i-c" name="c" [(ngModel)]="novaInteracao.contatoId">
                    <option [ngValue]="null">—</option>
                    @for (ct of contatos(); track ct.id) { <option [ngValue]="ct.id">{{ ct.nome }}</option> }
                  </select></div>
              }
            </div>
            <div class="campo"><label for="i-d">O que foi conversado? *</label>
              <textarea id="i-d" name="d" [(ngModel)]="novaInteracao.descricao" required maxlength="1000"></textarea></div>
            <button class="btn" type="submit" [disabled]="fi.invalid">Registrar interação</button>
          </form>
          <div class="cartao">
            <ul class="linha-tempo">
              @for (i of interacoes(); track i.id) {
                <li>
                  <div class="data">{{ i.data | date:'dd/MM/yyyy HH:mm' }} · <span class="selo">{{ rotulo[i.tipo] }}</span></div>
                  <div>{{ i.descricao }}</div>
                </li>
              } @empty { <div class="vazio">Nenhuma interação registrada.</div> }
            </ul>
          </div>
        }

        @case ('anotacoes') {
          <form class="cartao" style="margin-bottom:1rem" (ngSubmit)="addAnotacao()" #fa="ngForm">
            <div class="campo"><label for="a-t">Nova anotação</label>
              <textarea id="a-t" name="a" [(ngModel)]="textoAnotacao" required maxlength="2000"></textarea></div>
            <button class="btn" type="submit" [disabled]="fa.invalid">Salvar anotação</button>
          </form>
          @for (a of anotacoes(); track a.id) {
            <div class="cartao" style="margin-bottom:.6rem">
              <div class="data subtitulo">{{ a.criadoEm | date:'dd/MM/yyyy HH:mm' }}</div>
              <div style="white-space:pre-wrap">{{ a.texto }}</div>
              <button class="btn btn-sec btn-peq" style="margin-top:.5rem" (click)="delAnotacao(a)">Excluir</button>
            </div>
          } @empty { <div class="vazio">Nenhuma anotação.</div> }
        }

        @case ('oportunidade') {
          <form class="cartao" (ngSubmit)="addOportunidade()" #fo="ngForm">
            <div class="form-grade">
              <div class="campo"><label for="o-t">Título *</label><input id="o-t" name="t" [(ngModel)]="op.titulo" required maxlength="160"></div>
              <div class="campo"><label for="o-v">Valor (R$)</label><input id="o-v" name="v" type="number" min="0" [(ngModel)]="op.valor"></div>
              <div class="campo"><label for="o-e">Estágio</label>
                <select id="o-e" name="e" [(ngModel)]="op.estagio">
                  @for (e of estagios; track e) { <option [value]="e">{{ rotulo[e] }}</option> }
                </select></div>
              <div class="campo"><label for="o-p">Probabilidade (%)</label><input id="o-p" name="p" type="number" min="0" max="100" [(ngModel)]="op.probabilidade"></div>
              <div class="campo"><label for="o-f">Previsão de fechamento</label><input id="o-f" name="f" type="date" [(ngModel)]="op.previsao"></div>
            </div>
            <button class="btn" type="submit" [disabled]="fo.invalid">Criar oportunidade</button>
            <p class="subtitulo" style="margin-top:.5rem">Ela aparecerá no Funil de vendas.</p>
          </form>
        }
      }
    } @else if (!erro()) {
      <div class="vazio">Carregando...</div>
    }
  `
})
export class ClienteDetalhe {
  private api = inject(ApiService);
  // O Angular preenche "id" a partir do parâmetro da rota (/clientes/:id).
  id = input.required<string>();

  rotulo = ROTULO;
  tipos = TIPOS_INTERACAO;
  estagios = ESTAGIOS;

  cliente = signal<Cliente | null>(null);
  contatos = signal<Contato[]>([]);
  interacoes = signal<Interacao[]>([]);
  anotacoes = signal<Anotacao[]>([]);
  aba = signal<Aba>('contatos');
  erro = signal('');
  ok = signal('');

  novoContato: Partial<Contato> = { nome: '' };
  novaInteracao: { tipo: TipoInteracao; contatoId: number | null; descricao: string } =
    { tipo: 'Ligacao', contatoId: null, descricao: '' };
  textoAnotacao = '';
  op = { titulo: '', valor: 0, estagio: 'Prospeccao', probabilidade: 10, previsao: '' };

  constructor() {
    effect(() => { this.carregarTudo(Number(this.id())); });
  }

  private falha = (e: unknown) => this.erro.set(ApiService.mensagemErro(e));

  carregarTudo(id: number) {
    this.api.cliente(id).subscribe({ next: c => { this.cliente.set(c); this.erro.set(''); }, error: this.falha });
    this.recarregarContatos(id);
    this.recarregarInteracoes(id);
    this.recarregarAnotacoes(id);
  }

  private recarregarContatos(id = Number(this.id())) { this.api.contatos(id).subscribe({ next: r => this.contatos.set(r), error: this.falha }); }
  private recarregarInteracoes(id = Number(this.id())) { this.api.interacoes(id).subscribe({ next: r => this.interacoes.set(r), error: this.falha }); }
  private recarregarAnotacoes(id = Number(this.id())) { this.api.anotacoes({ clienteId: id }).subscribe({ next: r => this.anotacoes.set(r), error: this.falha }); }

  addContato() {
    this.api.criarContato(Number(this.id()), this.novoContato).subscribe({
      next: () => { this.novoContato = { nome: '' }; this.recarregarContatos(); },
      error: this.falha
    });
  }
  delContato(c: Contato) {
    if (!confirm(`Excluir o contato ${c.nome}?`)) return;
    this.api.excluirContato(Number(this.id()), c.id).subscribe({ next: () => this.recarregarContatos(), error: this.falha });
  }

  addInteracao() {
    this.api.registrarInteracao(Number(this.id()), {
      tipo: this.novaInteracao.tipo, descricao: this.novaInteracao.descricao,
      ...(this.novaInteracao.contatoId ? { contatoId: this.novaInteracao.contatoId } : {})
    } as Partial<Interacao>).subscribe({
      next: () => { this.novaInteracao = { tipo: 'Ligacao', contatoId: null, descricao: '' }; this.recarregarInteracoes(); },
      error: this.falha
    });
  }

  addAnotacao() {
    this.api.criarAnotacao({ texto: this.textoAnotacao, clienteId: Number(this.id()) }).subscribe({
      next: () => { this.textoAnotacao = ''; this.recarregarAnotacoes(); },
      error: this.falha
    });
  }
  delAnotacao(a: Anotacao) {
    this.api.excluirAnotacao(a.id).subscribe({ next: () => this.recarregarAnotacoes(), error: this.falha });
  }

  addOportunidade() {
    this.api.criarOportunidade({
      titulo: this.op.titulo, valor: this.op.valor ?? 0, clienteId: Number(this.id()),
      estagio: this.op.estagio as never, probabilidade: this.op.probabilidade ?? 0,
      previsaoFechamento: this.op.previsao || null
    }).subscribe({
      next: () => {
        this.op = { titulo: '', valor: 0, estagio: 'Prospeccao', probabilidade: 10, previsao: '' };
        this.erro.set('');
        this.ok.set('Oportunidade criada! Veja no Funil de vendas.');
        setTimeout(() => this.ok.set(''), 4000);
      },
      error: this.falha
    });
  }
}
