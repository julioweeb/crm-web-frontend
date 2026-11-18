# CRM — Front-end

Interface web do CRM multiempresa, desenvolvida em Angular. O front-end consome a API ASP.NET Core do projeto de back-end disponível no GitHub.

- **Aplicação:** [crm-web-frontend-eta.vercel.app](https://crm-web-frontend-eta.vercel.app)
- **API:** [crm-api-lbhm.onrender.com](https://crm-api-lbhm.onrender.com)

## Demonstração

- **Empresa:** Demonstração Enterprise
- **E-mail:** `demonstracao@demo.com`
- **Senha:** `User123@`
- **Perfil:** Admiinistrador

Esta é uma conta pública compartilhada para demonstração. Não armazene nela dados pessoais, reais ou confidenciais.

## Funcionalidades

- Login e gerenciamento do perfil do usuário.
- Dashboard, clientes, contatos e histórico de interações.
- Leads e conversão em clientes.
- Funil de vendas com movimentação de oportunidades.
- Tarefas e agenda.
- Usuários e empresas conforme o perfil de acesso.
- Interface responsiva para computador, tablet e celular.

## Tecnologias

- Angular e TypeScript
- Componentes standalone e carregamento sob demanda
- RxJS
- CSS

## Executar localmente

Pré-requisitos: Node.js e npm instalados, além da API em execução ou acessível.

```bash
npm ci
npm start
```

O servidor local do Angular abre em `http://localhost:4200`.

### Configurar o endereço da API

O endereço é definido em `public/config.js`, que é carregado pela aplicação no navegador. O arquivo no repositório está configurado para a API publicada. Para desenvolvimento local, altere o valor para:

```js
window.__CRM_CONFIG__ = {
  apiUrl: 'http://localhost:5080/api'
};
```

Antes de publicar, confirme que o arquivo aponta para o endereço da API desejada e termina em `/api`. A API também precisa permitir a origem do front-end na configuração de CORS.

## Build

Para gerar a versão de produção:

```bash
npm run build
```

Os arquivos são gerados em `dist/crm-web/browser`.

## Publicação na Vercel

O repositório inclui `vercel.json` com fallback para `index.html`, necessário para as rotas do Angular. Na configuração do projeto Vercel, use:

- **Framework Preset:** Angular
- **Build Command:** `npm run build`
- **Output Directory:** `dist/crm-web/browser`

O endereço da API publicado fica em `public/config.js`. Após alterar esse arquivo, faça novo commit e deploy.

## Segurança

O front-end mantém o token de autenticação na sessão do navegador e o envia à API nas requisições protegidas. A autorização efetiva e o isolamento dos dados são aplicados pelo back-end. A conta de demonstração é pública; use-a apenas com dados fictícios.
