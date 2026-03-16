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
STORE_ADMIN_PASSWORD=G3n3s1sK0r3K@2010
STORE_ADMIN_SESSION_TOKEN=genesis-admin-session-ok
UPLOAD_STORAGE_DIR=.uploads
```

## Google Sheets para newsletter

Se quiser salvar os leads da newsletter em uma planilha do Google Sheets, adicione estas variaveis:

```bash
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY=
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SHEETS_SHEET_NAME=Leads
```

Fluxo de configuracao:

1. Crie uma conta de servico no Google Cloud com acesso ao Google Sheets API.
2. Gere a chave JSON dessa conta de servico.
3. Copie o `client_email` para `GOOGLE_SHEETS_CLIENT_EMAIL`.
4. Copie a `private_key` para `GOOGLE_SHEETS_PRIVATE_KEY`.
   Use a chave completa com `\\n` no lugar das quebras de linha ao salvar na Railway.
5. Copie o ID da planilha para `GOOGLE_SHEETS_SPREADSHEET_ID`.
6. Compartilhe a planilha com o e-mail da conta de servico, com permissao de edicao.
7. Opcionalmente, crie uma aba chamada `Leads` ou informe outro nome em `GOOGLE_SHEETS_SHEET_NAME`.

Mesmo com a integracao ativa, a loja continua salvando uma copia local do lead como backup.

## Rotas

- `/`
- `/produtos/[slug]`
- `/favoritos`
- `/sobre`
- `/contato`
- `/admin-loja`
- `/admin-loja/login`
