# Especificacao da API de Forgot Password

## Objetivo
Definir o fluxo de solicitacao de recuperacao de senha sem enumeracao de conta, com disparo de e-mail via SMTP.

## Stack do cenario
- ASP.NET Core: endpoint e orquestracao.
- ASP.NET Core Identity: localizacao de usuario e politicas de lockout.
- PostgreSQL: persistencia de solicitacao de recuperacao.
- Redis: rate limit, anti-abuso e cooldown de reenvio.
- SMTP: entrega do OTP de recuperacao.

## Endpoint
- POST /v1/auth/forgot-password

## Request
- identifier: string (e-mail)

## Response de sucesso
- status: "accepted"
- expires_in: number

## HTTP status esperados
- 200: solicitacao aceita (inclusive quando conta nao existir)
- 400: payload invalido
- 401: operacao nao autorizada
- 403: acesso negado
- 404: rota nao encontrada
- 409: conflito de solicitacao ativa
- 429: excesso de tentativas
- 500: erro interno

## Regras de seguranca
- Nao revelar existencia de conta no retorno.
- Rate limit por IP e identificador (Redis).
- Cooldown para reenvio de codigo.
- Auditoria do evento em `auth_audit_log`.
- Persistencia da solicitacao em `auth_password_recovery_requests`.

Fluxo de navegacao do App Router:
- Sucesso em forgot-password redireciona para `/{lang}/verify-otp`.
- Sucesso em verify-otp redireciona para `/{lang}/reset-password`.

Suporte ao fluxo protegido:
- O identificador pode ser mantido temporariamente em cookie HttpOnly de recuperacao para uso interno do fluxo.

## Persistencia e referencias
Tabelas usadas:
- `AspNetUsers`
- `auth_password_recovery_requests`
- `auth_recovery_otp_codes`
- `auth_email_outbox`

Detalhes de schema em [docs/api/database.md](docs/api/database.md).

## SMTP e MailHog
Para testes locais:
- Configurar SMTP da API para MailHog (`localhost:1025`).
- Ver e-mails em `http://localhost:8025`.

Variaveis de ambiente sugeridas:
- SMTP_HOST
- SMTP_PORT
- SMTP_USERNAME
- SMTP_PASSWORD
- SMTP_USE_TLS
- SMTP_FROM

## Contrato de notificacao do front-end
- Mensagem exibida ao usuario depende apenas do HTTP status.
- Nao usar mensagem textual da API como texto final de UI.
