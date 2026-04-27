# Especificacao da API de Verify OTP

## Objetivo
Definir a validacao do OTP da recuperacao de senha e emissao de token temporario de reset protegido por cookie de curta duracao.

## Stack do cenario
- ASP.NET Core: endpoint de validacao e reenvio.
- ASP.NET Core Identity: correlacao com usuario e controles de bloqueio.
- PostgreSQL: armazenamento de OTP hash e token de reset hash.
- Redis: limite de tentativas e cooldown de reenvio.

## Endpoints
- POST /v1/auth/verify-otp
- POST /v1/auth/resend-otp

## Request de verificacao
- identifier: string
- otp_code: string (6 digitos)

## Response de sucesso da verificacao
- status: "verified"
- reset_token: string
- reset_token_expires_in: number

Regra de integracao web:
- Ao verificar OTP com sucesso, o backend web grava o `reset_token` em cookie HttpOnly de curta duracao.
- O front-end redireciona para a rota de App Router `/{lang}/reset-password` sem expor token em querystring.

## Request de reenvio
- identifier: string

## Response de sucesso do reenvio
- status: "resent"
- expires_in: number

## HTTP status esperados
- 200: codigo validado ou reenviado
- 400: payload invalido
- 401: codigo invalido/expirado
- 403: acesso negado
- 404: rota nao encontrada
- 409: codigo ja consumido
- 429: excesso de tentativas
- 500: erro interno

## Regras de seguranca
- OTP armazenado apenas em hash.
- OTP com expiracao curta e uso unico.
- Limite de tentativas por solicitacao.
- Cooldown entre reenvios.
- Emissao de `reset_token` com hash, expiracao curta e uso unico.
- O token de reset nao deve trafegar em URL.
- O cookie do token deve usar `HttpOnly`, `SameSite=Strict`, `Secure` em producao e TTL curto.
- Auditoria de sucesso/falha em `auth_audit_log`.

## Persistencia e referencias
Tabelas usadas:
- `auth_password_recovery_requests`
- `auth_recovery_otp_codes`
- `auth_recovery_reset_tokens`
- `auth_email_outbox` (reenvio)

Detalhes de schema em [docs/api/database.md](docs/api/database.md).

## Contrato de notificacao do front-end
- Mensagem exibida ao usuario depende apenas do HTTP status.
- Nao usar mensagem textual da API como texto final de UI.
