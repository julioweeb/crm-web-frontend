import { Clientes } from './clientes';

describe('Clientes', () => {
  it('deve estar disponível para a aplicação', () => {
    expect(Clientes).toBeDefined();
  });
});
