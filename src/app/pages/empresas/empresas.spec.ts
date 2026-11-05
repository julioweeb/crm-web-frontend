import { Empresas } from './empresas';

describe('Empresas', () => {
  it('deve estar disponível para a aplicação', () => {
    expect(Empresas).toBeDefined();
  });
});
