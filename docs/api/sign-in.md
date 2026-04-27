# Especificacao da API de Sign-In

## Objetivo
Definir os contratos e requisitos tecnicos do login usando ASP.NET Core, ASP.NET Core Identity, PostgreSQL e Redis, com sessao baseada em cookie seguro.

## Escopo atual
Coberto neste momento:
- Login com identificador (email) e senha.
- Emissao de sessao autenticada.
- Renovacao de sessao.
- Encerramento de sessao.
- Mensageria de feedback no front-end baseada somente em HTTP status.

Fora de escopo atual:
- MFA/OTP.
- Login social.
- Cadastro e recuperacao de senha (documentar separadamente).

## Stack obrigatoria do cenario de sign-in

### ASP.NET Core
Responsabilidade:
- Expor endpoints de autenticacao.
- Orquestrar validacao de credenciais via Identity.
- Emitir e revogar sessoes.
- Aplicar regras de seguranca de cookie e cabecalhos HTTP.

### ASP.NET Core Identity
Responsabilidade:
- Gerenciar usuario, hash de senha, lockout e claims.
- Validar senha com o pipeline oficial.
- Atualizar contadores de falha (`AccessFailedCount`) e bloqueio (`LockoutEnd`) quando necessario.

### PostgreSQL
Responsabilidade:
- Fonte de verdade para usuarios e sessoes.
- Persistencia de auditoria e historico de autenticacao.
- Integridade relacional de papeis e claims.

Tabelas de referencia:
- Ver [docs/api/database.md](docs/api/database.md).
- Tabelas minimas: `AspNetUsers`, `AspNetRoles`, `AspNetUserRoles`, `AspNetUserClaims`, `AspNetRoleClaims`, `auth_sessions`, `auth_audit_log`.

### Redis
Responsabilidade:
- Cache de controle de abuso e seguranca operacional.
- Rate limit por IP e identificador.
- Lock temporario e blacklist de sessao comprometida.

Chaves recomendadas:
- `auth:ratelimit:ip:{ip}`
- `auth:ratelimit:identifier:{identifier}`
- `auth:lock:{identifier}`
- `auth:session:blacklist:{sessionId}`

## Fluxo funcional de sign-in (sem MFA)
1. Cliente envia `identifier` e `password` para `POST /v1/auth/sign-in`.
2. API valida formato minimo e politicas de lock/rate limit (Redis + Identity).
3. Identity valida senha e lockout.
4. Em caso de sucesso, API cria sessao e devolve payload de autenticacao.
5. Servidor web grava cookie seguro com `session_id`.
6. Front-end exibe mensagem pelo HTTP status e redireciona para area privada.

## Endpoints necessarios

### 1) Iniciar autenticacao
Endpoint:
- POST /v1/auth/sign-in

Request:
- identifier: string (obrigatorio)
- password: string (obrigatorio)
- remember_me: boolean (opcional)
- device: objeto opcional

Device sugerido:
- id: string
- name: string
- type: string
- platform: string
- ip: string opcional
- user_agent: string opcional

Headers recomendados:
- X-Request-Id
- X-Correlation-Id
- Accept-Language

Response de sucesso:
- status: "authenticated"
- session:
  - access_token: string
  - token_type: string
  - expires_in: number
  - refresh_token: string (opcional)
  - refresh_expires_in: number (opcional)
  - session_id: string
- user:
  - id: string
  - email: string
  - display_name: string
  - roles: string[]
  - permissions: string[] (opcional)

Response de erro (padrao):
- error.code: string
- error.message: string (ingles, para logs/suporte)
- error.details: array opcional
- error.request_id: string

HTTP status esperados:
- 200: autenticado
- 400: payload invalido
- 401: credenciais invalidas ou sessao nao autenticada
- 403: usuario sem permissao de acesso
- 404: recurso/rota de autenticacao indisponivel
- 409: conflito de estado de sessao
- 429: excesso de tentativas
- 500: erro interno

### 2) Consultar sessao ativa
Endpoint:
- GET /v1/auth/session

Objetivo:
- Confirmar se a sessao atual continua valida.

Response de sucesso:
- status: "active"
- user: objeto resumido
- session: metadados nao sensiveis

### 3) Renovar sessao
Endpoint:
- POST /v1/auth/session/refresh

Objetivo:
- Trocar credencial de renovacao por nova sessao.

Request:
- refresh_token: string (ou cookie seguro)
- session_id: string (opcional)

Response de sucesso:
- status: "refreshed"
- session: novo objeto de sessao

### 4) Encerrar sessao
Endpoint:
- POST /v1/auth/sign-out

Objetivo:
- Revogar sessao atual (e opcionalmente todas).

Request:
- session_id: string (opcional)
- revoke_all_sessions: boolean (opcional)

Response de sucesso:
- status: "signed_out"

## Contrato de notificacao no front-end

Regra de padrao:
- Mensagens de UI usam somente HTTP status.
- Nao usar `error.code` para texto exibido ao usuario.
- Nao usar `error.message` da API como texto final.

Motivo:
- Manutencao mais simples.
- Menor acoplamento entre API e dicionarios.
- Menor risco de mensagens especificas virarem sinal para abuso ou listas de bloqueio por padroes de erro.

Fluxo:
1. Server action retorna `httpStatus` e `notificationToken`.
2. Camada de notificacao escolhe variante do toast por classe do status.
3. Dicionario resolve mensagem por status (`200`, `400`, `401`, etc.).

## Sessao por cookie e seguranca

Cookie de autenticacao:
- `HttpOnly`: obrigatorio.
- `Secure`: obrigatorio em producao.
- `SameSite=Strict`: recomendado para reduzir CSRF.
- `Path=/`: obrigatorio.
- `Max-Age`: alinhado ao `expires_in` da sessao.
- `Priority=High`: recomendado.

Controles de seguranca obrigatorios:
- TLS em todo trafego.
- Rate limit adaptativo (IP + identificador) com Redis.
- Lockout progressivo com Identity.
- Mensagens nao enumeraveis para 401.
- Auditoria de tentativas de login em `auth_audit_log`.
- Armazenar hash de tokens/sessoes, nunca token bruto.
- Revogacao de sessao em logout e em eventos de risco.

## Relacao com as tabelas

Para o sign-in funcionar corretamente:
- Validacao de credenciais: `AspNetUsers`.
- Resolucao de autorizacao: `AspNetUserRoles`, `AspNetRoles`, `AspNetUserClaims`, `AspNetRoleClaims`.
- Ciclo de sessao: `auth_sessions`.
- Observabilidade e investigacao: `auth_audit_log`.

Detalhamento dos campos e indices:
- Ver [docs/api/database.md](docs/api/database.md).

## Criterios de pronto
- Endpoints implementados com contratos acima.
- Identity integrado ao PostgreSQL.
- Redis ativo para rate limit/lock.
- Cookie seguro aplicado no login.
- Rotas privadas bloqueadas sem sessao.
- Mensagens de UI padronizadas apenas por HTTP status.
