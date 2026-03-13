# Genesis Loja Clean

Projeto limpo da loja Genesis Distribuidora, separado da plataforma cripto.

## Stack

- Next.js 15
- React 19
- Tailwind CSS
- Dados locais em JSON

## Rodar localmente

```bash
npm install
npm run dev
```

## Deploy

Variaveis de ambiente minimas:

```bash
STORE_ADMIN_PASSWORD=Genesis@123
STORE_ADMIN_SESSION_TOKEN=genesis-admin-session-ok
UPLOAD_STORAGE_DIR=.uploads
```

## Rotas

- `/`
- `/produtos/[slug]`
- `/favoritos`
- `/sobre`
- `/contato`
- `/admin-loja`
- `/admin-loja/login`
