import { Component, inject, signal } from '@angular/core';
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
  rotulo = ROTULO;
  cor = COR_ESTAGIO;
  estagios = ESTAGIOS;
  colunas = signal<ColunaFunil[]>([]);
  sobre = signal<EstagioFunil | null>(null);
  erro = signal('');
  arrastando: OportunidadeItem | null = null;

  constructor() {
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
