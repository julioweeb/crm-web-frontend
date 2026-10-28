import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ResumoDashboard, ROTULO } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DecimalPipe],
  styles: [`
    .barra-linha { display: grid; grid-template-columns: 110px 1fr 90px; gap: .6rem; align-items: center; margin-bottom: .5rem; font-size: .9rem; }
    .barra { background: #e9edf3; border-radius: 999px; height: 14px; overflow: hidden; }
    .barra > div { height: 100%; background: var(--primaria); border-radius: 999px; }
    .barra.lead > div { background: #1f8a4c; }
    .num { text-align: right; color: var(--texto-suave); }
  `],
  template: `
    <div class="cabecalho">
      <div>
        <h1>Dashboard</h1>
        <p class="subtitulo">Visão geral das suas vendas</p>
      </div>
    </div>

    @if (erro()) { <div class="msg-erro">{{ erro() }}</div> }

    @if (r(); as d) {
      <div class="grade grade-4" style="margin-bottom:1rem">
        <div class="cartao indicador"><div class="rotulo">Clientes</div><div class="valor">{{ d.totalClientes }}</div></div>
        <div class="cartao indicador"><div class="rotulo">Leads ({{ d.leadsNovos }} novos)</div><div class="valor">{{ d.totalLeads }}</div></div>
        <div class="cartao indicador"><div class="rotulo">Oportunidades abertas</div><div class="valor">{{ d.oportunidadesAbertas }}</div></div>
        <div class="cartao indicador"><div class="rotulo">Valor em aberto</div><div class="valor">{{ d.valorEmAberto | currency:'BRL' }}</div></div>
        <div class="cartao indicador"><div class="rotulo">Ganho no mês</div><div class="valor">{{ d.valorGanhoNoMes | currency:'BRL' }}</div></div>
        <div class="cartao indicador"><div class="rotulo">Taxa de conversão</div><div class="valor">{{ d.taxaConversao | number:'1.0-1' }}%</div></div>
        <div class="cartao indicador"><div class="rotulo">Tarefas pendentes</div><div class="valor">{{ d.tarefasPendentes }}</div></div>
        <div class="cartao indicador"><div class="rotulo">Tarefas atrasadas</div>
          <div class="valor" [class.perigo]="d.tarefasAtrasadas > 0">{{ d.tarefasAtrasadas }}</div></div>
      </div>

      <div class="grade grade-2">
        <div class="cartao">
          <h2>Funil de vendas (valor)</h2>
          @for (e of d.funilResumo; track e.estagio) {
            <div class="barra-linha">
              <span>{{ rotulo[e.estagio] }}</span>
              <div class="barra"><div [style.width.%]="pct(e.valor, maxFunil())"></div></div>
              <span class="num">{{ e.quantidade }} · {{ e.valor | currency:'BRL':'symbol':'1.0-0' }}</span>
            </div>
          }
        </div>
        <div class="cartao">
          <h2>Leads por status</h2>
          @for (s of d.leadsPorStatus; track s.status) {
            <div class="barra-linha">
              <span>{{ rotulo[s.status] }}</span>
              <div class="barra lead"><div [style.width.%]="pct(s.quantidade, maxLeads())"></div></div>
              <span class="num">{{ s.quantidade }}</span>
            </div>
          } @empty {
            <div class="vazio">Nenhum lead cadastrado ainda.</div>
          }
        </div>
      </div>
    } @else if (!erro()) {
      <div class="vazio">Carregando indicadores...</div>
    }
  `
})
export class Dashboard {
  private api = inject(ApiService);
  rotulo = ROTULO;
  r = signal<ResumoDashboard | null>(null);
  erro = signal('');

  maxFunil = computed(() => Math.max(1, ...(this.r()?.funilResumo.map(f => f.valor) ?? [0])));
  maxLeads = computed(() => Math.max(1, ...(this.r()?.leadsPorStatus.map(l => l.quantidade) ?? [0])));

  constructor() {
    this.api.dashboard().subscribe({
      next: d => this.r.set(d),
      error: e => this.erro.set(ApiService.mensagemErro(e))
    });
  }

  pct(valor: number, max: number) { return Math.round((valor / max) * 100); }
}
