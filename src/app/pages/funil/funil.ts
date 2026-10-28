import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ColunaFunil, ESTAGIOS, EstagioFunil, OportunidadeItem, ROTULO } from '../../core/models';

@Component({
  selector: 'app-funil',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  styles: [`
    .quadro { display: flex; gap: .75rem; overflow-x: auto; padding-bottom: .5rem; align-items: flex-start; }
    .coluna { flex: 0 0 260px; background: #e9edf3; border-radius: var(--raio); padding: .6rem; min-height: 160px; }
    .coluna.alvo { outline: 2px dashed var(--primaria); background: #dde8fa; }
    .coluna h2 { font-size: .95rem; margin: 0; }
    .coluna .soma { font-size: .8rem; color: var(--texto-suave); margin-bottom: .6rem; }
    .card { background: #fff; border: 1px solid var(--borda); border-radius: var(--raio); padding: .6rem; margin-bottom: .5rem; cursor: grab; }
    .card:active { cursor: grabbing; }
    .card .tit { font-weight: 600; font-size: .9rem; }
    .card .meta { font-size: .8rem; color: var(--texto-suave); }
    .card select { margin-top: .4rem; font-size: .8rem; padding: .25rem; }
    .ganha { border-top: 3px solid var(--sucesso); } .perdida { border-top: 3px solid var(--perigo); }
    @media (max-width: 640px) { .coluna { flex-basis: 85vw; } }
  `],
  template: `
    <div class="cabecalho">
      <div>
        <h1>Funil de vendas</h1>
        <p class="subtitulo">Arraste os cartões entre as colunas (ou use o seletor "Mover para" no celular)</p>
      </div>
    </div>

    @if (erro()) { <div class="msg-erro" role="alert">{{ erro() }}</div> }

    <div class="quadro">
      @for (col of colunas(); track col.estagio) {
        <section class="coluna" [class.alvo]="sobre() === col.estagio" [class.ganha]="col.estagio === 'Ganha'" [class.perdida]="col.estagio === 'Perdida'"
                 (dragover)="$event.preventDefault(); sobre.set(col.estagio)"
                 (dragleave)="sobre.set(null)"
                 (drop)="soltar($event, col.estagio)">
          <h2>{{ rotulo[col.estagio] }} ({{ col.quantidade }})</h2>
          <div class="soma">{{ col.valorTotal | currency:'BRL' }}</div>

          @for (o of col.itens; track o.id) {
            <article class="card" draggable="true" (dragstart)="arrastando = o">
              <div class="tit">{{ o.titulo }}</div>
              <div class="meta"><a [routerLink]="['/clientes', o.clienteId]">{{ o.clienteNome }}</a></div>
              <div class="meta">{{ o.valor | currency:'BRL' }} · {{ o.probabilidade }}%</div>
              @if (o.previsaoFechamento) { <div class="meta">Previsão: {{ o.previsaoFechamento | date:'dd/MM/yyyy' }}</div> }
              <select [attr.aria-label]="'Mover ' + o.titulo" (change)="mover(o, $any($event.target).value)">
                <option value="">Mover para...</option>
                @for (e of estagios; track e) { @if (e !== o.estagio) { <option [value]="e">{{ rotulo[e] }}</option> } }
              </select>
            </article>
          } @empty { <div class="meta" style="text-align:center;padding:.5rem">Vazio</div> }
        </section>
      }
    </div>
  `
})
export class Funil {
  private api = inject(ApiService);
  rotulo = ROTULO;
  estagios = ESTAGIOS;
  colunas = signal<ColunaFunil[]>([]);
  sobre = signal<EstagioFunil | null>(null);
  erro = signal('');
  arrastando: OportunidadeItem | null = null;

  constructor() { this.carregar(); }

  carregar() {
    this.api.funil().subscribe({
      next: c => { this.colunas.set(c); this.erro.set(''); },
      error: e => this.erro.set(ApiService.mensagemErro(e))
    });
  }

  soltar(ev: DragEvent, destino: EstagioFunil) {
    ev.preventDefault();
    this.sobre.set(null);
    if (this.arrastando && this.arrastando.estagio !== destino) this.mover(this.arrastando, destino);
    this.arrastando = null;
  }

  mover(o: OportunidadeItem, destino: string) {
    if (!destino) return;
    this.api.mudarEstagio(o.id, destino as EstagioFunil).subscribe({
      next: () => this.carregar(),
      error: e => { this.erro.set(ApiService.mensagemErro(e)); this.carregar(); }
    });
  }
}
