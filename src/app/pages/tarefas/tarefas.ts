import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Cliente, ROTULO, STATUS_TAREFA, Tarefa, TIPOS_TAREFA } from '../../core/models';

@Component({
  selector: 'app-tarefas',
  imports: [FormsModule, DatePipe],
  templateUrl: './tarefas.html',
  styleUrl: './tarefas.scss',
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
    this.api.clientes({ tamanho: 100 }).subscribe({ next: (r) => this.clientes.set(r.itens) });
  }

  private vazia() {
    return {
      titulo: '',
      tipo: 'Tarefa',
      data: '',
      clienteId: null as number | null,
      descricao: '',
    };
  }

  atrasada(t: Tarefa) {
    return t.status !== 'Concluida' && new Date(t.dataVencimento) < new Date();
  }

  carregar() {
    this.api.tarefas({ status: this.status, atrasadas: this.atrasadas, tamanho: 100 }).subscribe({
      next: (r) => {
        this.itens.set(r.itens);
        this.erro.set('');
      },
      error: (e) => this.erro.set(ApiService.mensagemErro(e)),
    });
  }

  salvar() {
    this.api
      .criarTarefa({
        titulo: this.nova.titulo,
        tipo: this.nova.tipo as never,
        descricao: this.nova.descricao || null,
        // datetime-local vem sem fuso; new Date(...) interpreta no horário local do navegador.
        dataVencimento: new Date(this.nova.data).toISOString(),
        status: 'Pendente',
        clienteId: this.nova.clienteId,
      })
      .subscribe({
        next: () => {
          this.nova = this.vazia();
          this.mostrarForm.set(false);
          this.carregar();
        },
        error: (e) => this.erro.set(ApiService.mensagemErro(e)),
      });
  }

  concluir(t: Tarefa) {
    this.api
      .concluirTarefa(t.id)
      .subscribe({
        next: () => this.carregar(),
        error: (e) => this.erro.set(ApiService.mensagemErro(e)),
      });
  }

  excluir(t: Tarefa) {
    if (!confirm(`Excluir "${t.titulo}"?`)) return;
    this.api
      .excluirTarefa(t.id)
      .subscribe({
        next: () => this.carregar(),
        error: (e) => this.erro.set(ApiService.mensagemErro(e)),
      });
  }
}
