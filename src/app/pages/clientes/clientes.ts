import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Cliente } from '../../core/models';

@Component({
  selector: 'app-clientes',
  imports: [FormsModule, RouterLink],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss',
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

  constructor() {
    this.carregar();
  }

  buscar() {
    this.pagina.set(1);
    this.carregar();
  }
  irPara(p: number) {
    this.pagina.set(p);
    this.carregar();
  }

  carregar() {
    this.api
      .clientes({
        busca: this.busca,
        cidade: this.cidade,
        ativo: this.situacao,
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
    this.editando.set({ nome: '', ativo: true });
  }
  editar(c: Cliente) {
    this.editando.set({ ...c });
  }

  salvar() {
    const c = this.editando();
    if (!c) return;
    this.salvando.set(true);
    const req = c.id ? this.api.atualizarCliente(c.id, c) : this.api.criarCliente(c);
    req.subscribe({
      next: () => {
        this.salvando.set(false);
        this.editando.set(null);
        this.carregar();
      },
      error: (e) => {
        this.salvando.set(false);
        this.erro.set(ApiService.mensagemErro(e));
      },
    });
  }

  excluir(c: Cliente) {
    if (
      !confirm(
        `Excluir o cliente "${c.nome}"? Contatos e oportunidades dele também serão removidos.`,
      )
    )
      return;
    this.api.excluirCliente(c.id).subscribe({
      next: () => this.carregar(),
      error: (e) => this.erro.set(ApiService.mensagemErro(e)),
    });
  }
}
