import { Injectable, signal } from '@angular/core';

// Evento do navegador que permite mostrar o nosso próprio botão "Instalar app".
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Injectable({ providedIn: 'root' })
export class InstalarService {
  private evento: BeforeInstallPromptEvent | null = null;
  // true quando o navegador oferece a instalação (Chrome, Edge e Android; o Safari do iPhone não envia o evento).
  readonly disponivel = signal(false);

  constructor() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();               // impede o banner automático; mostramos o botão do menu
      this.evento = e as BeforeInstallPromptEvent;
      this.disponivel.set(true);
    });
    window.addEventListener('appinstalled', () => {
      this.evento = null;
      this.disponivel.set(false);
    });
  }

  async instalar() {
    const ev = this.evento;
    if (!ev) return;
    await ev.prompt();
    await ev.userChoice;
    this.evento = null;
    this.disponivel.set(false);
  }
}
