import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { COR_ESTAGIO, ResumoDashboard, ROTULO } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
  styles: [`
    /* Destaque da página: o funil em aberto, numa barra segmentada pelas cores dos estágios */
    .total { font-family: var(--fonte-titulo); font-weight: 600; font-size: 2.6rem; letter-spacing: -.03em; line-height: 1; }
    .barra-funil { display: flex; gap: 3px; height: 22px; margin: 1.1rem 0 1.25rem; border-radius: 11px; overflow: hidden; background: repeating-linear-gradient(45deg, var(--canvas), var(--canvas) 6px, #e4e9eb 6px, #e4e9eb 12px); }
    .barra-funil span { min-width: 8px; }
    .legenda { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: .9rem 1.25rem; }
    .legenda .item { border-left: 3px solid var(--cor); padding-left: .7rem; }
    .legenda .estagio { font-size: .85rem; color: var(--ink-2); }
    .legenda .valor { font-weight: 600; font-variant-numeric: tabular-nums; }
    .legenda .qtd { font-size: .8rem; color: var(--ink-3); }

    /* Indicadores: uma faixa única, separada por divisórias (não uma grade de cartões iguais) */
    .faixa { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); padding: 0; margin: 1rem 0; }
    .faixa > div { padding: 1.1rem 1.25rem; border-left: 1px solid var(--line); }
    .faixa > div:first-child { border-left: 0; }
    .faixa .rotulo { font-size: .85rem; color: var(--ink-2); }
    .faixa .valor { font-family: var(--fonte-titulo); font-weight: 600; font-size: 1.6rem; letter-spacing: -.02em; margin-top: .15rem; font-variant-numeric: tabular-nums; }
    .faixa .valor.alerta { color: var(--danger); }
    @media (max-width: 640px) { .faixa > div { border-left: 0; border-top: 1px solid var(--line); } .faixa > div:first-child { border-top: 0; } }

    .linha { display: grid; grid-template-columns: 120px 1fr 36px; gap: .75rem; align-items: center; margin-bottom: .6rem; font-size: .92rem; }
    .trilho { background: var(--canvas); border-radius: 999px; height: 10px; overflow: hidden; }
    .trilho > div { height: 100%; border-radius: 999px; background: var(--brand); }
    .qtd-n { text-align: right; font-variant-numeric: tabular-nums; color: var(--ink-2); }

    .tarefas { display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .tarefas .grande { font-family: var(--fonte-titulo); font-size: 2.2rem; font-weight: 600; line-height: 1; letter-spacing: -.02em; }
    .tarefas .grande.alerta { color: var(--danger); }
    .tarefas .legenda-t { color: var(--ink-2); font-size: .88rem; margin-top: .2rem; }
  `],
  template: `
    <div class="cabecalho">
      <div>
        <h1>Olá, {{ primeiroNome() }}</h1>
        <p class="subtitulo">Veja como estão suas vendas hoje.</p>
      </div>
      <a class="btn" routerLink="/funil">Abrir funil de vendas</a>
    </div>

    @if (erro()) { <div class="msg-erro" role="alert">{{ erro() }}</div> }

    @if (r(); as d) {
      <section class="cartao" aria-labelledby="t-funil">
        <h2 id="t-funil" style="margin-bottom:.35rem">Negociações em aberto</h2>
        <div class="total">{{ totalAberto() | currency:'BRL':'symbol':'1.0-0' }}</div>
        <div class="subtitulo">{{ d.oportunidadesAbertas }} oportunidade(s) em andamento</div>

        <div class="barra-funil" role="img" [attr.aria-label]="'Valor em aberto por estágio do funil'">
          @for (e of abertos(); track e.estagio) {
            @if (e.valor > 0) {
              <span [style.flex-grow]="e.valor" [style.background]="cor[e.estagio]" [title]="rotulo[e.estagio]"></span>
            }
          }
        </div>

        <div class="legenda">
          @for (e of d.funilResumo; track e.estagio) {
            <div class="item" [style.--cor]="cor[e.estagio]">
              <div class="estagio">{{ rotulo[e.estagio] }}</div>
              <div class="valor">{{ e.valor | currency:'BRL':'symbol':'1.0-0' }}</div>
              <div class="qtd">{{ e.quantidade }} {{ e.quantidade === 1 ? 'oportunidade' : 'oportunidades' }}</div>
            </div>
          }
        </div>
      </section>

      <section class="cartao faixa" aria-label="Indicadores">
        <div><div class="rotulo">Ganho no mês</div><div class="valor">{{ d.valorGanhoNoMes | currency:'BRL':'symbol':'1.0-0' }}</div></div>
        <div><div class="rotulo">Taxa de conversão</div><div class="valor">{{ d.taxaConversao | number:'1.0-1' }}%</div></div>
        <div><div class="rotulo">Clientes</div><div class="valor">{{ d.totalClientes }}</div></div>
        <div><div class="rotulo">Leads novos</div><div class="valor">{{ d.leadsNovos }}</div></div>
      </section>

      <div class="grade grade-2">
        <section class="cartao">
          <h2>Tarefas</h2>
          <div class="tarefas">
            <div>
              <div class="grande">{{ d.tarefasPendentes }}</div>
              <div class="legenda-t">pendentes</div>
            </div>
            <div>
              <div class="grande" [class.alerta]="d.tarefasAtrasadas > 0">{{ d.tarefasAtrasadas }}</div>
              <div class="legenda-t">atrasadas</div>
            </div>
          </div>
          <a routerLink="/tarefas">Ver tarefas e agenda</a>
        </section>

        <section class="cartao">
          <h2>Leads por status</h2>
          @for (s of d.leadsPorStatus; track s.status) {
            <div class="linha">
              <span>{{ rotulo[s.status] }}</span>
              <div class="trilho"><div [style.width.%]="pct(s.quantidade, maxLeads())"></div></div>
              <span class="qtd-n">{{ s.quantidade }}</span>
            </div>
          } @empty {
            <div class="vazio">Nenhum lead cadastrado ainda. <a routerLink="/leads">Cadastrar o primeiro lead</a></div>
          }
        </section>
      </div>
    } @else if (!erro()) {
      <div class="vazio">Carregando indicadores...</div>
    }
  `
})
export class Dashboard {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  rotulo = ROTULO;
  cor = COR_ESTAGIO;
  r = signal<ResumoDashboard | null>(null);
  erro = signal('');

  primeiroNome = computed(() => (this.auth.usuario()?.nome ?? '').split(' ')[0]);
  abertos = computed(() => (this.r()?.funilResumo ?? []).filter(e => e.estagio !== 'Ganha' && e.estagio !== 'Perdida'));
  totalAberto = computed(() => this.abertos().reduce((soma, e) => soma + e.valor, 0));
  maxLeads = computed(() => Math.max(1, ...(this.r()?.leadsPorStatus.map(l => l.quantidade) ?? [0])));

  constructor() {
    this.api.dashboard().subscribe({
      next: d => this.r.set(d),
      error: e => this.erro.set(ApiService.mensagemErro(e))
    });
  }

  pct(valor: number, max: number) { return Math.round((valor / max) * 100); }
}
