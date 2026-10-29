import { Injectable, signal } from '@angular/core';

export type Tema = 'claro' | 'escuro';
const CHAVE = 'crm_tema';

// Controla o tema claro/escuro. Sem escolha salva, segue a preferência do sistema operacional.
@Injectable({ providedIn: 'root' })
export class TemaService {
  readonly tema = signal<Tema>(this.inicial());

  constructor() {
    this.aplicar(this.tema());
  }

  alternar() {
    const novo: Tema = this.tema() === 'escuro' ? 'claro' : 'escuro';
    this.tema.set(novo);
    this.aplicar(novo);
    try { localStorage.setItem(CHAVE, novo); } catch { /* sem armazenamento: vale só nesta sessão */ }
  }

  private inicial(): Tema {
    try {
      const salvo = localStorage.getItem(CHAVE);
      if (salvo === 'claro' || salvo === 'escuro') return salvo;
    } catch { /* ignora */ }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
  }

  private aplicar(tema: Tema) {
    document.documentElement.setAttribute('data-tema', tema);
    // Cor da barra de status do celular / janela do app instalado.
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', tema === 'escuro' ? '#162129' : '#ffffff');
  }
}
