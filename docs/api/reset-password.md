# Especificacao da API de Reset Password

## Objetivo
Definir a troca de senha apos validacao do OTP, com token temporario de reset e invalidacao imediata apos uso.

## Stack do cenario
- ASP.NET Core: endpoint de redefinicao.
- ASP.NET Core Identity: atualizacao segura de senha e invalidacao de credenciais antigas.
- PostgreSQL: controle de token de reset e auditoria.
- Redis: apoio a anti-abuso e invalidacao de sessao em cache.

## Endpoint
- POST /v1/auth/reset-password

## Request
- identifier: string
- new_password: string

Token de autorizacao do reset:
- Deve ser enviado por cookie HttpOnly de curta expiracao (emitido apos `verify-otp`).
- Nao deve ser enviado em querystring.

## Response de sucesso
- status: "password_updated"

## HTTP status esperados
- 200: senha atualizada
- 400: payload invalido
- 401: token invalido/expirado
- 403: acesso negado
- 404: rota nao encontrada
- 409: token ja consumido
- 429: excesso de tentativas
- 500: erro interno

## Regras de seguranca
- Validar politica forte de senha no backend.
- Token de reset com uso unico e expiracao curta.
- Persistir apenas hash do token.
- Invalidar token apos uso bem-sucedido.
- Limpar cookie de token apos sucesso ou expiracao.
- Revogar sessoes ativas do usuario apos troca de senha.
- Registrar evento em `auth_audit_log`.

## Persistencia e referencias
Tabelas usadas:
- `AspNetUsers`
- `auth_recovery_reset_tokens`
- `auth_sessions`
- `auth_audit_log`

Detalhes de schema em [docs/api/database.md](docs/api/database.md).

## Contrato de notificacao do front-end
- Mensagem exibida ao usuario depende apenas do HTTP status.
- Nao usar mensagem textual da API como texto final de UI.
