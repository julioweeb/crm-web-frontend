import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from './config';
import { AuthResposta, Perfil, Usuario } from './models';

const CHAVE_TOKEN = 'crm_token';
const CHAVE_USUARIO = 'crm_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly usuario = signal<Usuario | null>(this.lerUsuario());
  readonly logado = computed(() => this.usuario() !== null && !!this.token);

  get token(): string | null {
    try { return sessionStorage.getItem(CHAVE_TOKEN); } catch { return null; }
  }

  temPerfil(...perfis: Perfil[]): boolean {
    const u = this.usuario();
    return !!u && perfis.includes(u.perfil);
  }

  login(email: string, senha: string) {
    return this.http.post<AuthResposta>(`${API_URL}/auth/login`, { email, senha })
      .pipe(tap(r => this.guardar(r)));
  }


  sair() {
    try {
      sessionStorage.removeItem(CHAVE_TOKEN);
      sessionStorage.removeItem(CHAVE_USUARIO);
    } catch { /* ignora */ }
    this.usuario.set(null);
    this.router.navigate(['/login']);
  }

  // O token fica em sessionStorage (some ao fechar a aba), reduzindo a exposição.
  private guardar(r: AuthResposta) {
    try {
      sessionStorage.setItem(CHAVE_TOKEN, r.token);
      sessionStorage.setItem(CHAVE_USUARIO, JSON.stringify(r.usuario));
    } catch { /* ignora */ }
    this.usuario.set(r.usuario);
  }

  private lerUsuario(): Usuario | null {
    try {
      const bruto = sessionStorage.getItem(CHAVE_USUARIO);
      return bruto ? (JSON.parse(bruto) as Usuario) : null;
    } catch { return null; }
  }
}
