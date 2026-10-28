import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from './api.service';

describe('ApiService.mensagemErro', () => {
  it('mostra a mensagem enviada pela API', () => {
    const e = new HttpErrorResponse({ status: 400, error: { erro: 'E-mail já cadastrado.' } });
    expect(ApiService.mensagemErro(e)).toBe('E-mail já cadastrado.');
  });

  it('avisa quando o servidor está fora do ar', () => {
    const e = new HttpErrorResponse({ status: 0 });
    expect(ApiService.mensagemErro(e)).toContain('conectar');
  });

  it('trata 403 como falta de permissão', () => {
    const e = new HttpErrorResponse({ status: 403 });
    expect(ApiService.mensagemErro(e)).toContain('permissão');
  });

  it('junta erros de validação do ASP.NET', () => {
    const e = new HttpErrorResponse({ status: 400, error: { errors: { Nome: ['Obrigatório.'] } } });
    expect(ApiService.mensagemErro(e)).toBe('Obrigatório.');
  });
});
