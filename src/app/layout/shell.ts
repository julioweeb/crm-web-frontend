import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, forkJoin, map, of, Subject, switchMap, timer } from 'rxjs';
import { ApiService } from '../core/api.service';
import { Cliente, Lead, OportunidadeItem, ROTULO, Tarefa } from '../core/models';
import { Sidebar } from './sidebar';

interface ResultadoBusca {
  clientes: Cliente[];
  leads: Lead[];
  oportunidades: OportunidadeItem[];
}
interface EstadoBusca {
  resultados: ResultadoBusca;
  erro: boolean;
}
const BUSCA_VAZIA: ResultadoBusca = { clientes: [], leads: [], oportunidades: [] };

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, DatePipe, Sidebar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  private termosBusca = new Subject<string>();

  menuAberto = signal(false);
  painelNotificacoes = signal(false);
  tarefasNotificacao = signal<Tarefa[]>([]);
  totalNotificacoes = () => this.tarefasNotificacao().length;
  termoBusca = signal('');
  buscaAberta = signal(false);
  buscando = signal(false);
  erroBusca = signal(false);
  resultadosBusca = signal<ResultadoBusca>(BUSCA_VAZIA);

  constructor() {
    timer(0, 60_000)
      .pipe(
        switchMap(() => {
          const agora = new Date();
          const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
          const inicioAmanha = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1);
          return forkJoin({
            atrasadas: this.api.tarefas({ atrasadas: true, tamanho: 100 }),
            hoje: this.api.tarefas({ de: inicioHoje.toISOString(), ate: inicioAmanha.toISOString(), tamanho: 100 }),
          }).pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((resultado) => {
        if (!resultado) return;
        const inicioAmanha = new Date();
        inicioAmanha.setHours(0, 0, 0, 0);
        inicioAmanha.setDate(inicioAmanha.getDate() + 1);
        const unicas = new Map<number, Tarefa>();
        for (const tarefa of [...resultado.atrasadas.itens, ...resultado.hoje.itens]) {
          if (tarefa.status !== 'Concluida' && new Date(tarefa.dataVencimento) < inicioAmanha) {
            unicas.set(tarefa.id, tarefa);
          }
        }
        this.tarefasNotificacao.set(
          [...unicas.values()].sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento)),
        );
      });

    this.termosBusca
      .pipe(
        debounceTime(250),
        map((termo) => termo.trim()),
        distinctUntilChanged(),
        switchMap((termo): import('rxjs').Observable<EstadoBusca> => {
          if (termo.length < 2) return of({ resultados: BUSCA_VAZIA, erro: false });
          this.buscando.set(true);
          return forkJoin({
            clientes: this.api.clientes({ busca: termo, tamanho: 5 }),
            leads: this.api.leads({ busca: termo, tamanho: 5 }),
            oportunidades: this.api.oportunidades({ busca: termo, tamanho: 5 }),
          }).pipe(
            map((resposta) => ({
              resultados: {
                clientes: resposta.clientes.itens,
                leads: resposta.leads.itens,
                oportunidades: resposta.oportunidades.itens,
              },
              erro: false,
            })),
            catchError(() => of({ resultados: BUSCA_VAZIA, erro: true })),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ resultados, erro }) => {
        this.resultadosBusca.set(resultados);
        this.erroBusca.set(erro);
        this.buscando.set(false);
      });
  }

  buscarGlobal(termo: string) {
    this.termoBusca.set(termo);
    this.buscaAberta.set(true);
    this.termosBusca.next(termo);
  }

  limparBusca() {
    this.termoBusca.set('');
    this.resultadosBusca.set(BUSCA_VAZIA);
    this.erroBusca.set(false);
    this.buscando.set(false);
    this.termosBusca.next('');
  }

  @HostListener('document:click')
  fecharPaineis() {
    this.painelNotificacoes.set(false);
    this.buscaAberta.set(false);
  }

  @HostListener('document:keydown.escape')
  fecharPaineisComEscape() {
    this.painelNotificacoes.set(false);
    this.buscaAberta.set(false);
  }

  rotulo = ROTULO;

  tarefaAtrasada(tarefa: Tarefa) {
    return new Date(tarefa.dataVencimento) < new Date();
  }
}

