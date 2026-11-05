import { Usuarios } from './usuarios';

describe('Usuarios', () => {
  it('deve estar disponível para a aplicação', () => {
    expect(Usuarios).toBeDefined();
  });
});
