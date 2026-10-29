import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InstalarService } from './core/instalar.service';
import { TemaService } from './core/tema.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class App {
  // Instanciados aqui para o tema ser aplicado e o evento de instalação ser capturado logo no início.
  private tema = inject(TemaService);
  private instalar = inject(InstalarService);
}
