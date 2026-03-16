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

## E-mail para newsletter

Se quiser receber os leads da newsletter por e-mail, adicione estas variaveis:

```bash
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=
NEWSLETTER_RECEIVER_EMAIL=Contato@genesisecom.com.br
```

Fluxo de configuracao:

1. Use a conta de e-mail que vai enviar as mensagens da loja.
2. Preencha `SMTP_HOST`, `SMTP_PORT` e `SMTP_SECURE` conforme o provedor de e-mail.
3. Preencha `SMTP_USER` e `SMTP_PASS` com as credenciais SMTP.
4. Use em `SMTP_FROM_EMAIL` o e-mail remetente desejado.
5. Use em `NEWSLETTER_RECEIVER_EMAIL` o e-mail que vai receber os leads.

Mesmo com a integracao ativa, a loja continua salvando uma copia local do lead como backup.

## Rotas

- `/`
- `/produtos/[slug]`
- `/favoritos`
- `/sobre`
- `/contato`
- `/admin-loja`
- `/admin-loja/login`
