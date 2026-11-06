import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import {
  COR_ESTAGIO,
  ColunaFunil,
  ESTAGIOS,
  EstagioFunil,
  OportunidadeItem,
  ROTULO,
} from '../../core/models';

@Component({
  selector: 'app-funil',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  styleUrl: './funil.scss',
  templateUrl: './funil.html',
})
export class Funil {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  rotulo = ROTULO;
  cor = COR_ESTAGIO;
  estagios = ESTAGIOS;
  colunas = signal<ColunaFunil[]>([]);
  busca = signal('');
  colunasExibidas = computed(() => {
    const termo = this.busca().trim().toLocaleLowerCase();
    if (!termo) return this.colunas();
    return this.colunas()
      .map((coluna) => {
        const itens = coluna.itens.filter((item) =>
          `${item.titulo} ${item.clienteNome}`.toLocaleLowerCase().includes(termo),
        );
        return { ...coluna, itens, quantidade: itens.length, valorTotal: itens.reduce((soma, item) => soma + item.valor, 0) };
      })
      .filter((coluna) => coluna.itens.length > 0);
  });
  sobre = signal<EstagioFunil | null>(null);
  erro = signal('');
  arrastando: OportunidadeItem | null = null;

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => this.busca.set(params.get('busca') ?? ''));
    this.carregar();
  }

  carregar() {
    this.api.funil().subscribe({
      next: (c) => {
        this.colunas.set(c);
        this.erro.set('');
      },
      error: (e) => this.erro.set(ApiService.mensagemErro(e)),
    });
  }

  soltar(ev: DragEvent, destino: EstagioFunil) {
    ev.preventDefault();
    this.sobre.set(null);
    if (this.arrastando && this.arrastando.estagio !== destino)
      this.mover(this.arrastando, destino);
    this.arrastando = null;
  }

  mover(o: OportunidadeItem, destino: string) {
    if (!destino) return;
    this.api.mudarEstagio(o.id, destino as EstagioFunil).subscribe({
      next: () => this.carregar(),
      error: (e) => {
        this.erro.set(ApiService.mensagemErro(e));
        this.carregar();
      },
    });
  }
}



