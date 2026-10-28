export type Perfil = 'Vendedor' | 'Gerente' | 'Admin';
export type StatusLead = 'Novo' | 'Contatado' | 'Qualificado' | 'Desqualificado' | 'Convertido';
export type EstagioFunil = 'Prospeccao' | 'Qualificacao' | 'Proposta' | 'Negociacao' | 'Ganha' | 'Perdida';
export type TipoInteracao = 'Ligacao' | 'Email' | 'Reuniao' | 'Mensagem' | 'Outro';
export type TipoTarefa = 'Tarefa' | 'Ligacao' | 'Reuniao' | 'Email';
export type StatusTarefa = 'Pendente' | 'EmAndamento' | 'Concluida';

export const STATUS_LEAD: StatusLead[] = ['Novo', 'Contatado', 'Qualificado', 'Desqualificado'];
export const ESTAGIOS: EstagioFunil[] = ['Prospeccao', 'Qualificacao', 'Proposta', 'Negociacao', 'Ganha', 'Perdida'];
export const TIPOS_INTERACAO: TipoInteracao[] = ['Ligacao', 'Email', 'Reuniao', 'Mensagem', 'Outro'];
export const TIPOS_TAREFA: TipoTarefa[] = ['Tarefa', 'Ligacao', 'Reuniao', 'Email'];
export const STATUS_TAREFA: StatusTarefa[] = ['Pendente', 'EmAndamento', 'Concluida'];
export const PERFIS: Perfil[] = ['Vendedor', 'Gerente', 'Admin'];

// Rótulos amigáveis para exibir na tela.
export const ROTULO: Record<string, string> = {
  Prospeccao: 'Prospecção', Qualificacao: 'Qualificação', Proposta: 'Proposta',
  Negociacao: 'Negociação', Ganha: 'Ganha', Perdida: 'Perdida',
  Novo: 'Novo', Contatado: 'Contatado', Qualificado: 'Qualificado',
  Desqualificado: 'Desqualificado', Convertido: 'Convertido',
  Ligacao: 'Ligação', Email: 'E-mail', Reuniao: 'Reunião', Mensagem: 'Mensagem',
  Outro: 'Outro', Tarefa: 'Tarefa',
  Pendente: 'Pendente', EmAndamento: 'Em andamento', Concluida: 'Concluída',
  Vendedor: 'Vendedor', Gerente: 'Gerente', Admin: 'Administrador'
};

export interface Usuario { id: number; nome: string; email: string; perfil: Perfil; ativo: boolean; }
export interface AuthResposta { token: string; expiraEm: string; usuario: Usuario; }
export interface Pagina<T> { total: number; pagina: number; tamanho: number; itens: T[]; }

export interface Cliente {
  id: number; nome: string; documento?: string | null; email?: string | null; telefone?: string | null;
  empresa?: string | null; endereco?: string | null; cidade?: string | null; estado?: string | null;
  ativo: boolean; criadoEm: string;
}
export interface Contato { id: number; clienteId: number; nome: string; cargo?: string | null; email?: string | null; telefone?: string | null; }
export interface Interacao { id: number; clienteId: number; tipo: TipoInteracao; descricao: string; data: string; }
export interface Anotacao { id: number; texto: string; clienteId?: number | null; criadoEm: string; }

export interface Lead {
  id: number; nome: string; email?: string | null; telefone?: string | null; empresa?: string | null;
  origem?: string | null; status: StatusLead; criadoEm: string; clienteConvertidoId?: number | null;
}

export interface OportunidadeItem {
  id: number; titulo: string; valor: number; estagio: EstagioFunil; probabilidade: number;
  previsaoFechamento?: string | null; clienteId: number; clienteNome: string; criadoEm: string;
}
export interface ColunaFunil { estagio: EstagioFunil; quantidade: number; valorTotal: number; itens: OportunidadeItem[]; }

export interface Tarefa {
  id: number; titulo: string; descricao?: string | null; tipo: TipoTarefa; dataVencimento: string;
  status: StatusTarefa; clienteId?: number | null; oportunidadeId?: number | null;
}

export interface ResumoDashboard {
  totalClientes: number; totalLeads: number; leadsNovos: number;
  oportunidadesAbertas: number; valorEmAberto: number; valorGanhoNoMes: number; taxaConversao: number;
  tarefasPendentes: number; tarefasAtrasadas: number;
  leadsPorStatus: { status: StatusLead; quantidade: number }[];
  funilResumo: { estagio: EstagioFunil; quantidade: number; valor: number }[];
}
