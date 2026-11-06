import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ROTULO } from '../../core/models';

@Component({
  selector: 'app-meu-perfil',
  imports: [FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class MeuPerfil {
  private api = inject(ApiService);
  auth = inject(AuthService);
  rotulo = ROTULO;

  nome = this.auth.usuario()?.nome ?? '';
  email = this.auth.usuario()?.email ?? '';
  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';
  erro = signal('');
  sucesso = signal('');
  salvando = signal(false);

  salvar() {
    this.erro.set('');
    this.sucesso.set('');

    const desejaTrocarSenha = !!(this.senhaAtual || this.novaSenha || this.confirmarSenha);
    if (desejaTrocarSenha) {
      if (!this.senhaAtual || !this.novaSenha || !this.confirmarSenha) {
        this.erro.set('Para trocar a senha, preencha a senha atual, a nova senha e a confirmação.');
        return;
      }
      if (
        this.novaSenha.length < 8 ||
        !/[A-Za-z]/.test(this.novaSenha) ||
        !/[0-9]/.test(this.novaSenha)
      ) {
        this.erro.set('A nova senha deve ter pelo menos 8 caracteres, incluindo letras e números.');
        return;
      }
      if (this.novaSenha !== this.confirmarSenha) {
        this.erro.set('A confirmação da nova senha não corresponde.');
        return;
      }
    }

    this.salvando.set(true);
    this.api
      .atualizarMeuPerfil({
        nome: this.nome,
        email: this.email,
        senhaAtual: desejaTrocarSenha ? this.senhaAtual : null,
        novaSenha: desejaTrocarSenha ? this.novaSenha : null,
      })
      .subscribe({
        next: (usuario) => {
          this.auth.atualizarUsuarioAtual(usuario);
          this.nome = usuario.nome;
          this.email = usuario.email;
          this.senhaAtual = '';
          this.novaSenha = '';
          this.confirmarSenha = '';
          this.sucesso.set('Seus dados foram atualizados.');
          this.salvando.set(false);
        },
        error: (e) => {
          this.erro.set(ApiService.mensagemErro(e));
          this.salvando.set(false);
        },
      });
  }
}
