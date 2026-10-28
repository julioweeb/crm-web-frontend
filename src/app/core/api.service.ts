import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { API_URL } from './config';
import {
  Anotacao, Cliente, ColunaFunil, Contato, EstagioFunil, Interacao, Lead, Pagina,
  ResumoDashboard, Tarefa, Usuario
} from './models';

type Filtros = Record<string, string | number | boolean | null | undefined>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private params(f?: Filtros): HttpParams {
    let p = new HttpParams();
    for (const [chave, valor] of Object.entries(f ?? {})) {
      if (valor !== null && valor !== undefined && valor !== '') p = p.set(chave, String(valor));
    }
    return p;
  }

  // ===== Dashboard =====
  dashboard() { return this.http.get<ResumoDashboard>(`${API_URL}/dashboard`); }

  // ===== Clientes =====
  clientes(f?: Filtros) { return this.http.get<Pagina<Cliente>>(`${API_URL}/clientes`, { params: this.params(f) }); }
  cliente(id: number) { return this.http.get<Cliente>(`${API_URL}/clientes/${id}`); }
  criarCliente(c: Partial<Cliente>) { return this.http.post<Cliente>(`${API_URL}/clientes`, c); }
  atualizarCliente(id: number, c: Partial<Cliente>) { return this.http.put<Cliente>(`${API_URL}/clientes/${id}`, c); }
  excluirCliente(id: number) { return this.http.delete<void>(`${API_URL}/clientes/${id}`); }

  contatos(clienteId: number) { return this.http.get<Contato[]>(`${API_URL}/clientes/${clienteId}/contatos`); }
  criarContato(clienteId: number, c: Partial<Contato>) { return this.http.post<Contato>(`${API_URL}/clientes/${clienteId}/contatos`, c); }
  excluirContato(clienteId: number, id: number) { return this.http.delete<void>(`${API_URL}/clientes/${clienteId}/contatos/${id}`); }

  interacoes(clienteId: number) { return this.http.get<Interacao[]>(`${API_URL}/clientes/${clienteId}/interacoes`); }
  registrarInteracao(clienteId: number, i: Partial<Interacao>) { return this.http.post<Interacao>(`${API_URL}/clientes/${clienteId}/interacoes`, i); }

  // ===== Anotações =====
  anotacoes(f: Filtros) { return this.http.get<Anotacao[]>(`${API_URL}/anotacoes`, { params: this.params(f) }); }
  criarAnotacao(a: { texto: string; clienteId?: number; oportunidadeId?: number; leadId?: number }) {
    return this.http.post<Anotacao>(`${API_URL}/anotacoes`, a);
  }
  excluirAnotacao(id: number) { return this.http.delete<void>(`${API_URL}/anotacoes/${id}`); }

  // ===== Leads =====
  leads(f?: Filtros) { return this.http.get<Pagina<Lead>>(`${API_URL}/leads`, { params: this.params(f) }); }
  criarLead(l: Partial<Lead>) { return this.http.post<Lead>(`${API_URL}/leads`, l); }
  atualizarLead(id: number, l: Partial<Lead>) { return this.http.put<Lead>(`${API_URL}/leads/${id}`, l); }
  excluirLead(id: number) { return this.http.delete<void>(`${API_URL}/leads/${id}`); }
  converterLead(id: number) { return this.http.post<Cliente>(`${API_URL}/leads/${id}/converter`, {}); }

  // ===== Oportunidades / funil =====
  funil() { return this.http.get<ColunaFunil[]>(`${API_URL}/oportunidades/funil`); }
  criarOportunidade(o: { titulo: string; valor: number; clienteId: number; estagio: EstagioFunil; probabilidade: number; previsaoFechamento?: string | null }) {
    return this.http.post(`${API_URL}/oportunidades`, o);
  }
  mudarEstagio(id: number, estagio: EstagioFunil) { return this.http.patch(`${API_URL}/oportunidades/${id}/estagio`, { estagio }); }
  excluirOportunidade(id: number) { return this.http.delete<void>(`${API_URL}/oportunidades/${id}`); }

  // ===== Tarefas =====
  tarefas(f?: Filtros) { return this.http.get<Pagina<Tarefa>>(`${API_URL}/tarefas`, { params: this.params(f) }); }
  criarTarefa(t: Partial<Tarefa>) { return this.http.post<Tarefa>(`${API_URL}/tarefas`, t); }
  concluirTarefa(id: number) { return this.http.patch<Tarefa>(`${API_URL}/tarefas/${id}/concluir`, {}); }
  excluirTarefa(id: number) { return this.http.delete<void>(`${API_URL}/tarefas/${id}`); }

  // ===== Usuários (Admin) =====
  usuarios() { return this.http.get<Usuario[]>(`${API_URL}/usuarios`); }
  criarUsuario(u: { nome: string; email: string; senha: string; perfil: string; ativo: boolean }) {
    return this.http.post<Usuario>(`${API_URL}/usuarios`, u);
  }
  atualizarUsuario(id: number, u: { nome: string; email: string; senha?: string; perfil: string; ativo: boolean }) {
    return this.http.put<Usuario>(`${API_URL}/usuarios/${id}`, u);
  }

  // Extrai a mensagem de erro enviada pela API ({ erro: "..." }) ou um texto padrão.
  static mensagemErro(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 0) return 'Não foi possível conectar ao servidor.';
      if (e.status === 403) return 'Você não tem permissão para esta ação.';
      if (e.status === 429) return 'Muitas tentativas. Aguarde um minuto.';
      const corpo = e.error as { erro?: string; errors?: Record<string, string[]> } | null;
      if (corpo?.erro) return corpo.erro;
      if (corpo?.errors) return Object.values(corpo.errors).flat().join(' ');
    }
    return 'Ocorreu um erro inesperado.';
  }
}
