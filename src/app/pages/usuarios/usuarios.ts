import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { PERFIS, ROTULO, Usuario } from '../../core/models';

interface FormUsuario {
  id?: number;
  nome: string;
  email: string;
  senha: string;
  perfil: string;
  ativo: boolean;
}

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios {
  private api = inject(ApiService);
  auth = inject(AuthService);
  rotulo = ROTULO;
  perfis = PERFIS;
  itens = signal<Usuario[]>([]);
  editando = signal<FormUsuario | null>(null);
  erro = signal('');

  constructor() {
    this.carregar();
  }

  carregar() {
    this.api
      .usuarios()
      .subscribe({
        next: (r) => this.itens.set(r),
        error: (e) => this.erro.set(ApiService.mensagemErro(e)),
      });
  }

  novo() {
    this.editando.set({ nome: '', email: '', senha: '', perfil: 'Vendedor', ativo: true });
  }
  editar(u: Usuario) {
    this.editando.set({
      id: u.id,
      nome: u.nome,
      email: u.email,
      senha: '',
      perfil: u.perfil,
      ativo: u.ativo,
    });
  }

  salvar() {
    const u = this.editando();
    if (!u) return;
    const corpo = {
      nome: u.nome,
      email: u.email,
      senha: u.senha,
      perfil: u.perfil,
      ativo: u.ativo,
    };
    const req = u.id
      ? this.api.atualizarUsuario(u.id, { ...corpo, senha: u.senha || undefined })
      : this.api.criarUsuario(corpo);
    req.subscribe({
      next: () => {
        this.editando.set(null);
        this.erro.set('');
        this.carregar();
      },
      error: (e) => this.erro.set(ApiService.mensagemErro(e)),
    });
  }
}
