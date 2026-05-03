# Planejamento da API de Usuários (Users)

Este documento detalha o plano de implementação para a API de Gerenciamento de Usuários, incluindo a criação de usuários e o vínculo flexível com Equipes e Perfis de Acesso.

## 1. Mudanças Propostas no Backend (ASP.NET Core)

### 1.1. Novas Entidades

Para suportar o relacionamento entre Usuários, Equipes e Perfis de Acesso, precisamos de uma tabela de vínculo (pivot) que permita que um usuário pertença a várias equipes, com um perfil específico em cada uma.

#### `apps/api/Api.Core/Entities/UserTeamAccess.cs` [NEW]
Esta entidade representa o acesso de um usuário a uma equipe específica sob um determinado perfil.
- **Propriedades**:
  - `Guid Id`: PK.
  - `string UserId`: FK -> User.Id (IdentityUser usa string por padrão).
  - `Guid TeamId`: FK -> Team.Id.
  - `Guid AccessProfileId`: FK -> AccessProfile.Id.
  - **Navegação**:
    - `User User`.
    - `Team Team`.
    - `AccessProfile AccessProfile`.

### 1.2. Atualização das Entidades Existentes [MODIFY]

#### `apps/api/Api.Core/Entities/User.cs`
- Adicionar `public virtual ICollection<UserTeamAccess> TeamAccesses { get; set; } = new List<UserTeamAccess>();`.

### 1.3. Configuração do `AppDbContext` [MODIFY]
- Adicionar `public DbSet<UserTeamAccess> UserTeamAccesses { get; set; }`.
- **Configuração de Segurança/Integridade**:
  - Implementar índice único composto em `(UserId, TeamId)` para garantir que um usuário não seja vinculado à mesma equipe mais de uma vez com perfis diferentes.

### 1.4. Controller da API (`UsersController`) [NEW]
- **Rota**: `v1/users`
- **Endpoints**:
  - `GET /`: Lista usuários do `ClientId` logado.
  - `GET /{id}`: Detalhes do usuário incluindo `TeamAccesses` (Include Team e AccessProfile).
  - `POST /`: 
    1. Cria o usuário no ASP.NET Identity (`UserManager.CreateAsync`).
    2. Registra os vínculos em `UserTeamAccesses`.
    3. Envia e-mail de boas-vindas/definição de senha (opcional/futuro).
  - `PUT /{id}`:
    1. Atualiza `DisplayName`, `Email` e `IsActive`.
    2. Sincroniza a lista de `UserTeamAccesses` (remove os antigos e insere os novos ou atualiza).
  - `DELETE /{id}`: Soft delete ou desativação (`IsActive = false`).

---

## 2. Integração no Frontend (Next.js)

### 2.1. Server Actions (`apps/web/lib/action/users.ts`) [MODIFY]
- Substituir a lógica de mock pelas chamadas reais à API usando o `apiClient`.
- **`saveUserAction`**: Deve formatar o payload incluindo o array de `teams` no formato esperado pelo contrato da API.

### 2.2. Contratos de Dados (DTOs)

#### Request de Criação/Edição
```json
{
  "name": "Arthur Corrêa",
  "email": "arthur@exemplo.com",
  "isActive": true,
  "teams": [
    { "teamId": "uuid-equipe-1", "profileId": "uuid-perfil-admin" },
    { "teamId": "uuid-equipe-2", "profileId": "uuid-perfil-editor" }
  ]
}
```

---

## 3. Regras de Negócio e Segurança

### 3.1. Multi-tenancy (Isolamento de Dados)
A aplicação opera em um modelo multi-tenant rigoroso baseado no `ClientId`.
- **Origem do Contexto**: O `ClientId` do usuário administrador logado é armazenado nos dados da sessão no Redis e retornado pelo endpoint de sessão (`GET /v1/auth/session`).
- **Listagem e Leitura**: O `UsersController` deve filtrar automaticamente todos os usuários pelo `ClientId` extraído dos dados da sessão no Redis (associada ao Session ID enviado no header `Authorization`). É terminantemente proibido listar ou acessar detalhes de usuários vinculados a outros `ClientId`.
- **Criação e Escrita**: Ao criar um novo usuário via `POST`, o `ClientId` do novo registro **deve** ser obrigatoriamente o mesmo do administrador que está realizando a operação (obtido via dados da sessão no Redis). A API não deve aceitar um `ClientId` no payload da requisição; ela deve injetar o ID do tenant logado no backend para evitar que um administrador crie usuários em outros tenants (Escalação de Privilégio).

- **Validação de Vínculos**: Ao associar equipes (`TeamId`) ou perfis (`AccessProfileId`), o backend deve validar se esses registros também pertencem ao mesmo `ClientId` do usuário logado.

### 3.2. Outras Regras
1.  **Unicidade de Vínculo**: A API deve retornar erro (400 Bad Request) se o payload tentar vincular a mesma `TeamId` múltiplas vezes para o mesmo usuário.
2.  **Permissões**: Apenas usuários com permissão `create`/`update` na tela `users` podem realizar estas operações.
3.  **ASP.NET Identity**: O e-mail deve ser único globalmente ou por tenant (configurável).


---

## 4. Expansão dos Dados de Sessão (Redis)

Para garantir respostas rápidas e verificações de permissão eficientes no frontend, o objeto de sessão armazenado no Redis deve ser expandido.

### 4.1. Estrutura Completa da Sessão
Ao realizar o login ou consultar a sessão, o objeto `user` deve conter a árvore completa de acessos:

```json
{
  "user": {
    "id": "uuid",
    "email": "...",
    "display_name": "...",
    "client_id": "uuid",
    "teams": [
      {
        "id": "uuid-equipe-1",
        "name": "Desenvolvimento",
        "access_profile": {
          "id": "uuid-perfil-admin",
          "name": "Administrador",
          "permissions": [
            { "screen_key": "users", "actions": ["view", "create", "update"] },
            { "screen_key": "teams", "actions": ["view"] }
          ]
        }
      }
    ]
  }
}
```

### 4.2. Implementação no Backend
- **Joins**: O `AuthController` deve realizar os joins necessários (`User` -> `UserTeamAccess` -> `Team` e `AccessProfile` -> `Permissions` -> `Screen`) ao gerar o JSON da sessão.
- **Cache**: Esses dados devem ser serializados e salvos na chave `session:{sessionId}` no Redis com o mesmo TTL do token.
- **Invalidação**: Caso o perfil de acesso ou os vínculos de um usuário sejam alterados, a sessão ativa no Redis deve ser invalidada ou atualizada para refletir as novas permissões imediatamente.

---

## 5. Plano de Verificação

### Testes de Integração
- Criar um usuário sem equipes e verificar se o `GET` retorna lista vazia.
- Criar um usuário com 2 equipes e perfis diferentes e validar a persistência.
- Tentar criar um usuário com a mesma equipe duplicada no JSON e validar se o sistema impede a operação (Unicidade).

### Testes de UI
- Validar se o componente `UserForm` exibe corretamente as descrições dos campos vindas do dicionário.
- Validar se o botão "Descartar" reseta corretamente os selects de equipe/perfil.
