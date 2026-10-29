import { TestBed } from '@angular/core/testing';
import { TemaService } from './tema.service';

describe('TemaService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-tema');
    TestBed.resetTestingModule();
  });

  it('começa no tema claro quando não há escolha salva nem preferência do sistema', () => {
    const t = TestBed.inject(TemaService);
    expect(t.tema()).toBe('claro');
    expect(document.documentElement.getAttribute('data-tema')).toBe('claro');
  });

  it('alterna para escuro e guarda a escolha', () => {
    const t = TestBed.inject(TemaService);
    t.alternar();
    expect(t.tema()).toBe('escuro');
    expect(document.documentElement.getAttribute('data-tema')).toBe('escuro');
    expect(localStorage.getItem('crm_tema')).toBe('escuro');
  });

  it('usa a escolha salva ao iniciar', () => {
    localStorage.setItem('crm_tema', 'escuro');
    const t = TestBed.inject(TemaService);
    expect(t.tema()).toBe('escuro');
  });
});
