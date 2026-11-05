import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Lead, ROTULO, STATUS_LEAD } from '../../core/models';

@Component({
  selector: 'app-leads',
  imports: [FormsModule, DatePipe],
  templateUrl: './leads.html',
  styleUrl: './leads.scss',
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

  constructor() {
    this.carregar();
  }

  irPara(p: number) {
    this.pagina.set(p);
    this.carregarPagina();
  }
  carregar() {
    this.pagina.set(1);
    this.carregarPagina();
  }

  private carregarPagina() {
    this.api
      .leads({
        busca: this.busca,
        status: this.status,
        pagina: this.pagina(),
        tamanho: this.tamanho,
      })
      .subscribe({
        next: (r) => {
          this.itens.set(r.itens);
          this.total.set(r.total);
          this.erro.set('');
        },
        error: (e) => this.erro.set(ApiService.mensagemErro(e)),
      });
  }

  novo() {
    this.editando.set({ nome: '', status: 'Novo' });
  }
  editar(l: Lead) {
    this.editando.set({ ...l });
  }

  salvar() {
    const l = this.editando();
    if (!l) return;
    const req = l.id ? this.api.atualizarLead(l.id, l) : this.api.criarLead(l);
    req.subscribe({
      next: () => {
        this.editando.set(null);
        this.carregarPagina();
      },
      error: (e) => this.erro.set(ApiService.mensagemErro(e)),
    });
  }

  converter(l: Lead) {
    if (!confirm(`Converter "${l.nome}" em cliente? Uma oportunidade será criada no funil.`))
      return;
    this.api.converterLead(l.id).subscribe({
      next: (c) => {
        this.ok.set(`"${c.nome}" agora é um cliente.`);
        setTimeout(() => this.ok.set(''), 4000);
        this.carregarPagina();
      },
      error: (e) => this.erro.set(ApiService.mensagemErro(e)),
    });
  }

  excluir(l: Lead) {
    if (!confirm(`Excluir o lead "${l.nome}"?`)) return;
    this.api
      .excluirLead(l.id)
      .subscribe({
        next: () => this.carregarPagina(),
        error: (e) => this.erro.set(ApiService.mensagemErro(e)),
      });
  }
}
