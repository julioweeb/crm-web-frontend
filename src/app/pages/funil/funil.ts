import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { COR_ESTAGIO, ColunaFunil, ESTAGIOS, EstagioFunil, OportunidadeItem, ROTULO } from '../../core/models';

@Component({
  selector: 'app-funil',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  styles: [`
    .quadro { display: flex; gap: .85rem; overflow-x: auto; padding-bottom: .75rem; align-items: flex-start; }
    .coluna { flex: 1 0 250px; background: var(--coluna); border-radius: var(--raio-g); padding: .75rem; min-height: 180px; }
    .coluna.alvo { outline: 2px dashed var(--cor); outline-offset: -2px; background: color-mix(in srgb, var(--cor) 16%, var(--surface)); }
    .topo { display: flex; align-items: center; gap: .5rem; margin-bottom: .15rem; }
    .topo .ponto { width: 10px; height: 10px; border-radius: 50%; background: var(--cor); flex: none; }
    .topo h2 { font-size: 1rem; margin: 0; flex: 1; }
    .topo .contagem { font-size: .8rem; font-weight: 600; background: var(--surface); border-radius: 999px; padding: 0 .55rem; color: var(--ink-2); }
    .soma { font-size: .85rem; color: var(--ink-2); margin: 0 0 .75rem 1.1rem; font-variant-numeric: tabular-nums; }
    .card { background: var(--surface); border: 1px solid var(--line); border-left: 4px solid var(--cor); border-radius: var(--raio); padding: .7rem .8rem; margin-bottom: .55rem; cursor: grab; }
    .card:hover { border-color: var(--line-strong); border-left-color: var(--cor); }
    .card:active { cursor: grabbing; }
    .card .tit { font-weight: 600; font-size: .92rem; line-height: 1.3; }
    .card .meta { font-size: .82rem; color: var(--ink-2); margin-top: .1rem; }
    .card .preco { font-weight: 600; font-variant-numeric: tabular-nums; color: var(--ink); }
    .card select { margin-top: .55rem; font-size: .8rem; padding: .3rem .5rem; }
    .vazio-col { text-align: center; padding: 1rem .5rem; color: var(--ink-3); font-size: .85rem; }
    @media (max-width: 640px) { .coluna { flex-basis: 85vw; } }
  `],
  template: `
    <div class="cabecalho">
      <div>
        <h1>Funil de vendas</h1>
        <p class="subtitulo">Arraste as oportunidades entre os estágios, ou use o seletor "Mover para" em cada cartão.</p>
      </div>
    </div>

    @if (erro()) { <div class="msg-erro" role="alert">{{ erro() }}</div> }

    <div class="quadro">
      @for (col of colunas(); track col.estagio) {
        <section class="coluna" [class.alvo]="sobre() === col.estagio" [style.--cor]="cor[col.estagio]"
                 (dragover)="$event.preventDefault(); sobre.set(col.estagio)"
                 (dragleave)="sobre.set(null)"
                 (drop)="soltar($event, col.estagio)">
          <div class="topo">
            <span class="ponto" aria-hidden="true"></span>
            <h2>{{ rotulo[col.estagio] }}</h2>
            <span class="contagem">{{ col.quantidade }}</span>
          </div>
          <p class="soma">{{ col.valorTotal | currency:'BRL' }}</p>

          @for (o of col.itens; track o.id) {
            <article class="card" draggable="true" (dragstart)="arrastando = o">
              <div class="tit">{{ o.titulo }}</div>
              <div class="meta"><a [routerLink]="['/clientes', o.clienteId]">{{ o.clienteNome }}</a></div>
              <div class="meta"><span class="preco">{{ o.valor | currency:'BRL' }}</span>, chance de {{ o.probabilidade }}%</div>
              @if (o.previsaoFechamento) { <div class="meta">Previsão: {{ o.previsaoFechamento | date:'dd/MM/yyyy' }}</div> }
              <select [attr.aria-label]="'Mover ' + o.titulo" (change)="mover(o, $any($event.target).value)">
                <option value="">Mover para...</option>
                @for (e of estagios; track e) { @if (e !== o.estagio) { <option [value]="e">{{ rotulo[e] }}</option> } }
              </select>
            </article>
          } @empty { <div class="vazio-col">Nenhuma oportunidade neste estágio</div> }
        </section>
      }
    </div>
  `
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
