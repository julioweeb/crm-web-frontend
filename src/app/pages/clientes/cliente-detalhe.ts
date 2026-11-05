import { Component, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import {
  Anotacao,
  Cliente,
  Contato,
  ESTAGIOS,
  Interacao,
  ROTULO,
  TIPOS_INTERACAO,
  TipoInteracao,
} from '../../core/models';

type Aba = 'contatos' | 'historico' | 'anotacoes' | 'oportunidade';

@Component({
  selector: 'app-cliente-detalhe',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './cliente-detalhe.html',
  styleUrl: './cliente-detalhe.scss',
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
  novaInteracao: { tipo: TipoInteracao; contatoId: number | null; descricao: string } = {
    tipo: 'Ligacao',
    contatoId: null,
    descricao: '',
  };
  textoAnotacao = '';
  op = { titulo: '', valor: 0, estagio: 'Prospeccao', probabilidade: 10, previsao: '' };

  constructor() {
    effect(() => {
      this.carregarTudo(Number(this.id()));
    });
  }

  private falha = (e: unknown) => this.erro.set(ApiService.mensagemErro(e));

  carregarTudo(id: number) {
    this.api.cliente(id).subscribe({
      next: (c) => {
        this.cliente.set(c);
        this.erro.set('');
      },
      error: this.falha,
    });
    this.recarregarContatos(id);
    this.recarregarInteracoes(id);
    this.recarregarAnotacoes(id);
  }

  private recarregarContatos(id = Number(this.id())) {
    this.api.contatos(id).subscribe({ next: (r) => this.contatos.set(r), error: this.falha });
  }
  private recarregarInteracoes(id = Number(this.id())) {
    this.api.interacoes(id).subscribe({ next: (r) => this.interacoes.set(r), error: this.falha });
  }
  private recarregarAnotacoes(id = Number(this.id())) {
    this.api
      .anotacoes({ clienteId: id })
      .subscribe({ next: (r) => this.anotacoes.set(r), error: this.falha });
  }

  addContato() {
    this.api.criarContato(Number(this.id()), this.novoContato).subscribe({
      next: () => {
        this.novoContato = { nome: '' };
        this.recarregarContatos();
      },
      error: this.falha,
    });
  }
  delContato(c: Contato) {
    if (!confirm(`Excluir o contato ${c.nome}?`)) return;
    this.api
      .excluirContato(Number(this.id()), c.id)
      .subscribe({ next: () => this.recarregarContatos(), error: this.falha });
  }

  addInteracao() {
    this.api
      .registrarInteracao(Number(this.id()), {
        tipo: this.novaInteracao.tipo,
        descricao: this.novaInteracao.descricao,
        ...(this.novaInteracao.contatoId ? { contatoId: this.novaInteracao.contatoId } : {}),
      } as Partial<Interacao>)
      .subscribe({
        next: () => {
          this.novaInteracao = { tipo: 'Ligacao', contatoId: null, descricao: '' };
          this.recarregarInteracoes();
        },
        error: this.falha,
      });
  }

  addAnotacao() {
    this.api.criarAnotacao({ texto: this.textoAnotacao, clienteId: Number(this.id()) }).subscribe({
      next: () => {
        this.textoAnotacao = '';
        this.recarregarAnotacoes();
      },
      error: this.falha,
    });
  }
  delAnotacao(a: Anotacao) {
    this.api
      .excluirAnotacao(a.id)
      .subscribe({ next: () => this.recarregarAnotacoes(), error: this.falha });
  }

  addOportunidade() {
    this.api
      .criarOportunidade({
        titulo: this.op.titulo,
        valor: this.op.valor ?? 0,
        clienteId: Number(this.id()),
        estagio: this.op.estagio as never,
        probabilidade: this.op.probabilidade ?? 0,
        previsaoFechamento: this.op.previsao || null,
      })
      .subscribe({
        next: () => {
          this.op = {
            titulo: '',
            valor: 0,
            estagio: 'Prospeccao',
            probabilidade: 10,
            previsao: '',
          };
          this.erro.set('');
          this.ok.set('Oportunidade criada! Veja no Funil de vendas.');
          setTimeout(() => this.ok.set(''), 4000);
        },
        error: this.falha,
      });
  }
}
