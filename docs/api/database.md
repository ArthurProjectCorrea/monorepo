# Banco de Dados para Sign-In

## Objetivo
Descrever as estruturas de dados necessarias para o fluxo de autenticacao (sign-in) usando ASP.NET Core Identity com PostgreSQL e Redis.

## Stack de persistencia
- PostgreSQL: fonte de verdade para usuarios, papeis, claims, sessoes e auditoria.
- Redis: cache e controle de abuso (rate limit, lock temporario e blacklist temporaria de sessao comprometida).

## Tabelas obrigatorias (PostgreSQL)

As tabelas abaixo sao necessarias para o login funcionar com ASP.NET Core Identity.

### 1) AspNetUsers
Responsabilidade:
- Armazenar identidade principal do usuario.

Campos relevantes para sign-in:
- Id (PK)
- UserName
- NormalizedUserName
- Email
- NormalizedEmail
- EmailConfirmed
- PasswordHash
- SecurityStamp
- ConcurrencyStamp
- LockoutEnd
- LockoutEnabled
- AccessFailedCount

Notas:
- Indices unicos em NormalizedUserName e, quando aplicavel, NormalizedEmail.
- PasswordHash deve sempre ser gerado e validado pelo Identity.

### 2) AspNetRoles
Responsabilidade:
- Catalogo de perfis/papeis.

Campos principais:
- Id (PK)
- Name
- NormalizedName

### 3) AspNetUserRoles
Responsabilidade:
- Relacao N:N entre usuario e papel.

Campos principais:
- UserId (FK -> AspNetUsers.Id)
- RoleId (FK -> AspNetRoles.Id)

### 4) AspNetUserClaims
Responsabilidade:
- Claims especificas do usuario utilizadas para autorizacao.

Campos principais:
- Id (PK)
- UserId (FK)
- ClaimType
- ClaimValue

### 5) AspNetRoleClaims
Responsabilidade:
- Claims por papel.

Campos principais:
- Id (PK)
- RoleId (FK)
- ClaimType
- ClaimValue

### 6) AspNetUserLogins
Responsabilidade:
- Vinculos para login externo (social/SSO), se habilitado no futuro.

### 7) AspNetUserTokens
Responsabilidade:
- Tokens de usuario usados pelo Identity em operacoes auxiliares.

## Tabelas de aplicacao recomendadas para sign-in

### 8) auth_sessions
Responsabilidade:
- Persistir sessao de autenticacao emitida para cada login.

Campos sugeridos:
- id (UUID, PK)
- user_id (FK -> AspNetUsers.Id)
- session_token_hash (texto)
- refresh_token_hash (texto, opcional)
- user_agent (texto)
- ip_address (inet/text)
- created_at (timestamp)
- expires_at (timestamp)
- revoked_at (timestamp, opcional)
- revoke_reason (texto, opcional)

Indices sugeridos:
- idx_auth_sessions_user_id
- idx_auth_sessions_expires_at
- idx_auth_sessions_revoked_at

### 9) auth_audit_log
Responsabilidade:
- Trilha de auditoria de eventos de autenticacao.

Campos sugeridos:
- id (bigserial, PK)
- user_id (FK opcional)
- event_type (SIGN_IN_SUCCESS, SIGN_IN_FAILURE, SIGN_OUT, SESSION_REVOKED)
- http_status (int)
- request_id (texto)
- ip_address
- user_agent
- metadata_json (jsonb)
- created_at

Indices sugeridos:
- idx_auth_audit_user_id
- idx_auth_audit_event_type
- idx_auth_audit_created_at

### 10) auth_login_attempts (opcional quando Redis nao estiver disponivel)
Responsabilidade:
- Fallback para contagem de tentativas e lockout por janela.

Campos sugeridos:
- id (bigserial, PK)
- identifier_normalized (texto)
- ip_address
- attempt_count
- window_start
- blocked_until

## Tabelas adicionais para recuperacao de senha

As tabelas abaixo suportam os fluxos de `forgot-password`, `verify-otp` e `reset-password`.

### 11) auth_password_recovery_requests
Responsabilidade:
- Registrar solicitacoes de recuperacao de senha.

Campos sugeridos:
- id (UUID, PK)
- user_id (FK -> AspNetUsers.Id, opcional para casos nao encontrados)
- identifier_hash (texto)
- status (PENDING, OTP_VERIFIED, COMPLETED, EXPIRED, CANCELED)
- otp_attempt_count (int)
- otp_last_sent_at (timestamp)
- otp_expires_at (timestamp)
- reset_token_expires_at (timestamp)
- created_at (timestamp)
- completed_at (timestamp, opcional)

Indices sugeridos:
- idx_recovery_user_id
- idx_recovery_status
- idx_recovery_created_at

### 12) auth_recovery_otp_codes
Responsabilidade:
- Persistir codigos OTP de recuperacao com hash.

Campos sugeridos:
- id (UUID, PK)
- recovery_request_id (FK -> auth_password_recovery_requests.id)
- otp_hash (texto)
- expires_at (timestamp)
- consumed_at (timestamp, opcional)
- created_at (timestamp)

Indices sugeridos:
- idx_recovery_otp_request_id
- idx_recovery_otp_expires_at

Regras:
- Nunca salvar OTP em texto claro.
- Invalida imediatamente apos consumo.

### 13) auth_recovery_reset_tokens
Responsabilidade:
- Guardar token de redefinicao emitido apos OTP validado.

Campos sugeridos:
- id (UUID, PK)
- recovery_request_id (FK)
- token_hash (texto)
- expires_at (timestamp)
- consumed_at (timestamp, opcional)
- created_at (timestamp)

Indices sugeridos:
- idx_recovery_token_request_id
- idx_recovery_token_expires_at

Regras:
- Persistir apenas hash do token.
- Token de uso unico.

### 14) auth_email_outbox
Responsabilidade:
- Fila de envio de e-mails de autenticacao (recuperacao, OTP, alertas).

Campos sugeridos:
- id (bigserial, PK)
- template_key (texto)
- recipient_email_hash (texto)
- subject (texto)
- payload_json (jsonb)
- provider (SMTP)
- status (PENDING, SENT, FAILED)
- retry_count (int)
- last_error (texto, opcional)
- created_at (timestamp)
- sent_at (timestamp, opcional)

Indices sugeridos:
- idx_outbox_status
- idx_outbox_created_at

## Uso do Redis no sign-in

Redis nao substitui o banco; ele acelera e protege o fluxo.

Chaves recomendadas:
- auth:ratelimit:ip:{ip}
- auth:ratelimit:identifier:{normalizedIdentifier}
- auth:lock:{normalizedIdentifier}
- auth:session:blacklist:{sessionId}
- auth:request:dedupe:{requestId}

Chaves adicionais para recuperacao de senha:
- auth:recovery:ratelimit:{identifier}
- auth:recovery:otp:attempts:{recoveryRequestId}
- auth:recovery:otp:resend:{identifier}
- auth:recovery:block:{identifier}

Politicas:
- TTL curto para rate limit e lock temporario.
- Blacklist de sessao com TTL ate expiracao da sessao.
- Nao armazenar senha ou token bruto em cache.

## Integridade e seguranca dos dados
- Nunca persistir senha em texto claro.
- Persistir somente hash de tokens/sessoes sensiveis.
- Auditoria sem dados sensiveis (senha, OTP, token bruto).
- Criptografia em repouso e backup com controles de acesso.

## SMTP e ambiente de teste com MailHog

Producao:
- SMTP autenticado com TLS.
- Rotacao de credenciais SMTP.
- Observabilidade de falhas de entrega.

Desenvolvimento/teste:
- Usar MailHog como destino SMTP local para validar disparos sem enviar e-mail real.

Configuracao sugerida da API:
- SMTP_HOST=localhost
- SMTP_PORT=1025
- SMTP_USERNAME=
- SMTP_PASSWORD=
- SMTP_USE_TLS=false
- SMTP_FROM=no-reply@local.test

UI de inspeção do MailHog:
- http://localhost:8025

Regras:
- Nunca logar corpo completo de e-mail com dados sensiveis.
- Registrar apenas metadados de entrega em `auth_email_outbox`.

## Relacao com a documentacao de API
- Os endpoints e contratos do login estao em [docs/api/sign-in.md](docs/api/sign-in.md).
- Sempre que houver alteracao em campos de sessao, claims ou lockout, atualizar os dois documentos em conjunto.
