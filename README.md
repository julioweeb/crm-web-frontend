# CRM – Front-end (Angular)

Interface do CRM em **Angular** (componentes standalone, signals, lazy loading), responsiva para computador, tablet e celular.
A API fica em um repositório separado (`crm-backend`, ASP.NET Core).

## Telas
Login/cadastro · Dashboard · Clientes (com contatos, histórico e anotações) · Leads · Funil de vendas (arrastar e soltar) · Tarefas e agenda · Usuários (somente Admin).

## Como rodar
Pré-requisito: Node 20+ e a API rodando.

```bash
npm install
npx ng serve      # http://localhost:4200
```

### Endereço da API
Ajuste em [`src/app/core/config.ts`](src/app/core/config.ts):

```ts
export const API_URL = 'http://localhost:5080/api';
```

Ao publicar, troque pela URL da API em produção (terminando em `/api`) e libere a URL deste front no CORS da API (`Cors:Origens`).

## Build e testes
```bash
npx ng build                  # saída em dist/crm-web/browser
npx ng test --watch=false
```

## Deploy (Vercel / Netlify)
Publique `dist/crm-web/browser` com regra de fallback para `index.html` (o app usa rotas do Angular).

## Segurança
O token JWT fica em `sessionStorage` (some ao fechar a aba); toda chamada à API leva `Authorization: Bearer`, e um 401 desloga o usuário. As rotas são protegidas por guards, mas a autorização real é sempre feita pela API.
