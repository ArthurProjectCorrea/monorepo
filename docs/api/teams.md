# Planejamento da API de Equipes (Teams)

Este documento descreve as necessidades técnicas para a implementação da API de Equipes e a integração com a interface de gerenciamento de times no portal.

## 1. Mudanças Propostas no Backend (ASP.NET Core)

### 1.1. Nova Entidade `Team`
A entidade `Team` deve ser criada para suportar o conceito de multi-tenancy e armazenar os dados básicos de cada equipe.

#### `apps/api/Api.Core/Entities/Team.cs` [NEW]
- **Propriedades**:
  - `Guid Id`: Identificador único (PK).
  - `string Name`: Nome da equipe (Obrigatório, Max: 100).
  - `string? Icon`: Nome do ícone da Lucide (Opcional).
  - `bool IsActive`: Status da equipe (Default: true).
  - `Guid ClientId`: Vínculo com o cliente/tenant (FK -> Client.Id).
  - `DateTime CreatedAt`: Data de criação.
  - `DateTime UpdatedAt`: Data da última atualização.
  - `DateTime? DeletedAt`: Data de exclusão (Soft Delete).

### 1.2. Atualização do `AppDbContext`
Adicionar a nova entidade ao contexto do banco de dados para possibilitar as migrações e consultas.

#### `apps/api/Api.Infrastructure/Data/AppDbContext.cs` [MODIFY]
- Adicionar `public DbSet<Team> Teams { get; set; }`.

### 1.3. Atualização do Seeding (`DbInitializer`)
Garantir que a tela de equipes exista e que exista um registro inicial para teste.

#### `apps/api/Api.Infrastructure/Data/DbInitializer.cs` [MODIFY]
- **Inserir Tela de Equipes**: Adicionar apenas a tela com a chave `teams` vinculada ao `defaultClient.Id`.
  ```csharp
  new Screen {
      Title = "Cadastro de Equipes",
      Description = "Gerencie os times, usuários e permissões do sistema.",
      ScreenKey = "teams",
      ClientId = defaultClient.Id,
      IsActive = true
  }
  ```
- **Inserir Equipe Inicial**: Criar apenas uma equipe padrão (ex: "Administração") para o `defaultClient.Id` caso a tabela esteja vazia.

### 1.4. Migrations
- Executar `dotnet ef migrations add AddTeamsTable` para gerar a tabela no PostgreSQL.

### 1.5. Controller da API (`TeamsController`)
Gerenciar as operações CRUD para equipes, respeitando o isolamento por `ClientId`.

#### `apps/api/Api.Web/Controllers/TeamsController.cs` [NEW]
- **Rota**: `v1/teams`
- **Endpoints**:
  - `GET /`: Lista equipes do `ClientId` do usuário logado (Filtrar `DeletedAt == null`).
  - `GET /{id}`: Detalhes de uma equipe específica.
  - `POST /`: Cria nova equipe.
  - `PUT /{id}`: Atualiza equipe (Nome, Ícone, Status).
  - `DELETE /{id}`: Soft Delete (Preencher `DeletedAt` com a data atual).
- **Segurança**: Uso de `[Authorize]` e resolução de `ClientId` via Redis (`session:{sessionId}`).

---

## 2. Mudanças Propostas no Frontend (Next.js)

### 2.1. Server Actions
Substituir o uso de `data.json` por chamadas reais à API.

#### `apps/web/lib/action/teams.ts` [MODIFY]
- **`getTeamsData`**: Alterar para buscar de `GET /api/v1/teams`.
- **`updateTeamAction`**: Alterar para chamar `POST` (se novo) ou `PUT /api/v1/teams/{id}` (se edição).
- **`deleteTeamAction`**: Alterar para chamar `DELETE /api/v1/teams/{id}`.

### 2.2. Atualização da Página
A página deve continuar consumindo os dados através das Server Actions, mas agora refletindo o estado real do banco de dados.

#### `apps/web/app/[lang]/[domain]/settings/teams/page.tsx` [MODIFY]
- Garantir que o `pageData` retornado pela API contenha tanto a lista de `data` quanto os metadados da `screen` (título e descrição).

### 2.3. Dicionários e Internacionalização
As notificações de sucesso e erro para as operações de equipe devem ser padronizadas nos dicionários de tradução.

- **Comando para criar estrutura**:
  ```bash
  npm run lang:create "notifications.teams" -- --notifications
  ```
- **Localização**: As chaves geradas em `notifications.teams` (success, error) devem ser utilizadas nas Server Actions e componentes de tabela para exibir Toasts consistentes.

---

## 3. Estrutura de Dados (Contratos)

### Modelo de Resposta (GET /v1/teams)
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Nome da Equipe",
      "icon": "Users",
      "status": true,
      "updated_at": "2024-04-30T10:00:00Z"
    }
  ],
  "screen": {
    "title": "Cadastro de Equipes",
    "description": "Gerencie os times..."
  }
}
```

### Modelo de Requisição (POST/PUT /v1/teams)
```json
{
  "name": "Nova Equipe",
  "icon": "ShieldIcon",
  "isActive": true
}
```

---

## 4. Plano de Verificação

### Automatizado
- Executar migrações e verificar criação da tabela `Teams`.
- Validar se o Seed inseriu a tela `teams` corretamente.

### Manual
1. Acessar a página `/settings/teams`.
2. Verificar se a lista de equipes é carregada da API (não mais do `data.json`).
3. Criar uma nova equipe e validar se aparece na tabela.
4. Editar uma equipe existente (trocar nome/ícone) e validar persistência.
5. Excluir uma equipe e validar remoção.
6. Garantir que as notificações (Toasts) usem os dicionários de tradução corretamente.
