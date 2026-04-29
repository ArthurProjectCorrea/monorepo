# Planejamento da API de Parâmetros de Tela

O objetivo desta API é fornecer os dados para a tela de "Parâmetros de Tela" (`screens`), permitindo que as alterações (títulos, descrições e status) sejam individualizadas por cliente (Tenant).

## Proposed Changes

### 1. Atualização da Entidade `Screen`
A entidade `Screen` atual será atualizada para suportar o conceito de *multi-tenancy*. 
- **Adicionar `ClientId`**: Será adicionada a propriedade `ClientId` (`Guid`) para vincular a tela a um cliente específico.
- **Configuração da Entidade**: O `Id` já está configurado como `Guid` por padrão no C#. Não será necessário alterá-lo.

#### `apps/api/Api.Core/Entities/Screen.cs`
- Adicionar `public Guid ClientId { get; set; }` e a propriedade de navegação `public Client? Client { get; set; }`.

### 2. Atualização do Seeding (`DbInitializer`)
A API deve criar o registro de tela padrão na tabela `Screens` durante a inicialização do banco de dados (Seed), garantindo que pertença ao cliente correto.
- **Inserir tela inicial**: Apenas a tela principal de parâmetros ("Parâmetros de Tela", com a chave `screen_parameters`) será criada. Os demais dados em `screens.json` são fictícios (mock) e devem ser ignorados.
- **Vínculo com Cliente**: A tela inserida no seed será vinculada ao `defaultClient.Id`.

#### `apps/api/Api.Infrastructure/Data/DbInitializer.cs`
- Atualizar a rotina de inserção da entidade `Screen` para incluir a tela `screen_parameters` (caso não exista) e preencher a chave `ClientId`.

### 3. Migrations
Após alterar o modelo e o DbInitializer, será gerada e aplicada uma nova migration do Entity Framework.

- Executar o comando `dotnet ef migrations add AddScreenClientId` para aplicar as alterações ao banco de dados PostgreSQL.

### 4. Controller da API (`ScreensController`)
Um novo controlador será criado para gerenciar as chamadas HTTP relacionadas aos parâmetros de tela. As restrições de negócio estabelecem que o controlador **não pode criar e não pode deletar** registros, operando estritamente em um escopo de atualização e listagem.

#### `apps/api/Api.Web/Controllers/ScreensController.cs`
- **Autorização (`[Authorize]`)**: Garantir que apenas requisições autenticadas tenham acesso.
- **Resolução de Cliente (Redis)**: Recuperar o `ClientId` do usuário logado através do cache Redis (`session:{sessionId}`).
- **`[HttpGet]`**: Retornar a lista de telas filtradas exclusivamente pelo `ClientId` do usuário.
- **`[HttpPut("{id}")]`**: Atualizar título, descrição e `isActive` de uma tela existente, garantindo que o registro pertença ao `ClientId` do usuário.

### 5. Integração com o Web (Next.js)
A aplicação front-end deve ser atualizada para consumir a nova API, removendo a dependência dos dados fictícios (mock) presentes em `screens.json`.

#### Server Actions (`apps/web/app/[lang]/[domain]/parameters/screens/actions.ts`)
- **`getScreens`**: Criar uma Server Action para buscar as telas através da rota `GET /api/v1/parameters/screens`. Esta action deve utilizar o sistema de proxy de API configurado com o token do usuário.
- **`updateScreen`**: Criar uma Server Action responsável por chamar `PUT /api/v1/parameters/screens/{id}`. Deve tratar os erros de forma padronizada e realizar o `revalidatePath` para atualizar a tabela na tela após o sucesso.

#### Atualização da Interface (`apps/web/app/[lang]/[domain]/parameters/screens/page.tsx`)
- Modificar o carregamento dos dados na página para chamar a Server Action `getScreens` ao invés de ler do arquivo estático `screens.json`.
- Integrar a Server Action `updateScreen` no formulário `ScreenForm`, substituindo o comportamento atual de simulação (`setTimeout`).

#### Dicionário e Notificações (I18n)
- Utilizar o script gerenciador de idiomas para criar a estrutura padronizada de notificações para as telas:
  ```bash
  npm run lang:create "notifications.screens" -- --notifications
  ```
- Atualizar as mensagens geradas nos arquivos de idioma (`en.json`, `pt.json`, etc.) com os textos reais para o contexto de Parâmetros de Tela.

## Verification Plan

### Testes Manuais
1. Rodar o projeto da API (`dotnet run`).
2. Verificar no Console/DB se a migration foi executada e a tabela `Screens` ganhou a coluna `ClientId`.
3. Consultar a tabela `Screens` no banco de dados e garantir que a tela "Parâmetros de Tela" (`screen_parameters`) foi criada com sucesso e vinculada ao cliente padrão.
4. Fazer uma requisição `GET /api/v1/parameters/screens` autenticado e garantir que apenas as telas do cliente logado são retornadas.
5. Fazer uma requisição `PUT /api/v1/parameters/screens/{id}` simulando a interface Web (apenas título, descrição e isActive).
6. Tentar fazer `POST` ou `DELETE` e verificar se a API retorna código 405 (Method Not Allowed) ou 404 (Not Found).
