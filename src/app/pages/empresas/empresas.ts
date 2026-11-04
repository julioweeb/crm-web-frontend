import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Empresa } from '../../core/models';

interface FormEmpresa { nome: string; adminNome: string; adminEmail: string; adminSenha: string; }

@Component({
  selector: 'app-empresas',
  imports: [FormsModule, DatePipe],
  templateUrl: './empresas.html'
})
export class Empresas {
  private api = inject(ApiService);
  itens = signal<Empresa[]>([]);
  erro = signal('');
  sucesso = signal('');
  carregando = signal(false);
  form: FormEmpresa = { nome: '', adminNome: '', adminEmail: '', adminSenha: '' };

  constructor() { this.carregar(); }

  carregar() {
    this.api.empresas().subscribe({
      next: r => this.itens.set(r),
      error: e => this.erro.set(ApiService.mensagemErro(e))
    });
  }

  salvar() {
    this.erro.set('');
    this.sucesso.set('');
    this.carregando.set(true);
    this.api.criarEmpresa(this.form).subscribe({
      next: empresa => {
        this.sucesso.set('Empresa "' + empresa.nome + '" criada com o primeiro Admin vinculado.');
        this.form = { nome: '', adminNome: '', adminEmail: '', adminSenha: '' };
        this.carregar();
        this.carregando.set(false);
      },
      error: e => {
        this.erro.set(ApiService.mensagemErro(e));
        this.carregando.set(false);
      }
    });
  }
}