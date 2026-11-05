import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  senha = '';
  carregando = signal(false);
  erro = signal('');

  enviar() {
    this.erro.set('');
    this.carregando.set(true);
    this.auth.login(this.email, this.senha).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => {
        this.erro.set(ApiService.mensagemErro(e));
        this.carregando.set(false);
      },
    });
  }
}
