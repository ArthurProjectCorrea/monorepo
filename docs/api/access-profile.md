# Planejamento da API de Perfis de Acesso (Access Profiles)

Este documento detalha o plano de implementação para a API de Perfis de Acesso e a migração da lógica de permissões mockadas para uma solução persistente no banco de dados.

## 1. Mudanças Propostas no Backend (ASP.NET Core)

### 1.1. Novas Entidades

Para suportar perfis de acesso e permissões granulares, precisamos de duas novas tabelas.

#### `apps/api/Api.Core/Entities/AccessProfile.cs` [NEW]
- **Propriedades**:
  - `Guid Id`: PK.
  - `string Name`: Nome do perfil (ex: "Administrador").
  - `string? Description`: Descrição das responsabilidades.
  - `bool IsActive`: Status (Default: true).
  - `Guid ClientId`: FK -> Client.Id (Isolamento por tenant).
  - `DateTime CreatedAt`, `DateTime UpdatedAt`.
  - `ICollection<AccessProfilePermission> Permissions`: Relacionamento 1:N.

#### `apps/api/Api.Core/Entities/AccessProfilePermission.cs` [NEW]
- **Propriedades**:
  - `Guid Id`: PK.
  - `Guid AccessProfileId`: FK -> AccessProfile.Id.
  - `Guid ScreenId`: FK -> Screen.Id.
  - `string ActionId`: Identificador da ação (ex: "view", "create", "update", "delete").
  - `AccessProfile? AccessProfile`: Navegação.
  - `Screen? Screen`: Navegação.

### 1.2. Atualização do `AppDbContext` [MODIFY]
- Adicionar `public DbSet<AccessProfile> AccessProfiles { get; set; }`.
- Adicionar `public DbSet<AccessProfilePermission> AccessProfilePermissions { get; set; }`.
- Configurar chave composta ou índices em `AccessProfilePermissions` para evitar duplicidade (`AccessProfileId` + `ScreenId` + `ActionId`).

### 1.3. Seeding e Migrações

#### `DbInitializer.cs` [MODIFY]
1.  **Registrar Tela**: Adicionar a tela `access_profiles` caso não exista.
    ```csharp
    new Screen {
        Title = "Perfil de Acesso",
        Description = "Gerencie as permissões e perfis de acesso do sistema.",
        ScreenKey = "access_profiles",
        ClientId = defaultClient.Id,
        IsActive = true
    }
    ```
2.  **Perfil Admin**: Criar o perfil "Administrador" padrão.
3.  **Permissões Seed**: Atribuir todas as permissões ao perfil Admin baseando-se no mapeamento de `apps/web/lib/permission.ts`:
    - `general`: view, update
    - `screen_parameters`: view, update
    - `teams`: view, create, update, delete
    - `access_profiles`: view, create, update, delete

#### Migration
- Executar `dotnet ef migrations add AddAccessProfilesTable`.

### 1.4. Controller da API (`AccessProfilesController`) [NEW]
- **Rota**: `v1/access-profiles`
- **Endpoints**:
  - `GET /`: Lista perfis do `ClientId` logado.
  - `GET /{id}`: Detalhes do perfil incluindo a lista de permissões (`Include`).
  - `POST /`: Cria perfil e suas permissões associadas.
  - `PUT /{id}`: Atualiza dados básicos e sincroniza a lista de permissões (Delete/Insert das permissões alteradas).
  - `DELETE /{id}`: Soft Delete ou restrição se houver usuários vinculados.

---

## 2. Integração no Frontend (Next.js)

### 2.1. Server Actions (`apps/web/lib/action/access-profiles.ts`) [NEW]
- **`getAccessProfilesData`**: Chama `GET /v1/access-profiles`.
- **`getAccessProfileDetail(id)`**: Chama `GET /v1/access-profiles/{id}`.
- **`saveAccessProfileAction`**: Recebe o formulário, mapeia as permissões do estado para o formato da API e chama `POST` ou `PUT`.

### 2.2. Atualização de Páginas [MODIFY]
Substituir a importação de `profilesData` do JSON pelas chamadas de Server Actions.

- `app/[lang]/[domain]/settings/access-profiles/page.tsx`
- `app/[lang]/[domain]/settings/access-profiles/[id]/page.tsx`
- `app/[lang]/[domain]/settings/access-profiles/new/page.tsx`

---

## 3. Estrutura de Dados (Contratos)

### Modelo de Resposta Detalhado
```json
{
  "id": "uuid",
  "name": "Administrador",
  "description": "Acesso total",
  "isActive": true,
  "permissions": [
    { "screenId": "teams", "actionId": "view" },
    { "screenId": "teams", "actionId": "create" }
  ]
}
```

---

## 4. Plano de Verificação

### Backend
- Validar se o Seed criou o perfil Admin com as 12 permissões iniciais.
- Testar o endpoint `PUT` garantindo que a remoção de um checkbox no front reflete no delete da linha em `AccessProfilePermissions`.

### Frontend
- Verificar se a lista de "Items" no formulário reflete as permissões persistidas.
- Validar a navegação de volta após o salvamento bem-sucedido.
