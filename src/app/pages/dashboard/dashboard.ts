import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { COR_ESTAGIO, ResumoDashboard, ROTULO } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  rotulo = ROTULO;
  cor = COR_ESTAGIO;
  r = signal<ResumoDashboard | null>(null);
  erro = signal('');

  primeiroNome = computed(() => (this.auth.usuario()?.nome ?? '').split(' ')[0]);
  abertos = computed(() =>
    (this.r()?.funilResumo ?? []).filter((e) => e.estagio !== 'Ganha' && e.estagio !== 'Perdida'),
  );
  totalAberto = computed(() => this.abertos().reduce((soma, e) => soma + e.valor, 0));
  maxLeads = computed(() =>
    Math.max(1, ...(this.r()?.leadsPorStatus.map((l) => l.quantidade) ?? [0])),
  );

  constructor() {
    this.api.dashboard().subscribe({
      next: (d) => this.r.set(d),
      error: (e) => this.erro.set(ApiService.mensagemErro(e)),
    });
  }

  pct(valor: number, max: number) {
    return Math.round((valor / max) * 100);
  }
}
