import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, computed, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { catchError, forkJoin, of, switchMap, timer } from 'rxjs';
import { ApiService } from '../core/api.service';
import { Tarefa } from '../core/models';
import { Sidebar } from './sidebar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, DatePipe, Sidebar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  menuAberto = signal(false);
  painelNotificacoes = signal(false);
  tarefasNotificacao = signal<Tarefa[]>([]);
  totalNotificacoes = computed(() => this.tarefasNotificacao().length);

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
  }

  @HostListener('document:click')
  fecharNotificacoes() {
    this.painelNotificacoes.set(false);
  }

  @HostListener('document:keydown.escape')
  fecharNotificacoesComEscape() {
    this.painelNotificacoes.set(false);
  }

  tarefaAtrasada(tarefa: Tarefa) {
    return new Date(tarefa.dataVencimento) < new Date();
  }
}


