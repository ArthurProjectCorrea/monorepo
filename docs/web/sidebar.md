
## Sidebar

O componente Sidebar é o núcleo da navegação da aplicação, sendo responsável por agrupar os links de acesso rápido, gerenciamento de times (Team Switcher) e informações do usuário autenticado. Ele utiliza um sistema de dados dinâmico que adapta as URLs com base no domínio do cliente atual.

### Objeto esperado

Atualmente, o Sidebar consome dados processados localmente via `getSidebarData`, mas sua estrutura está preparada para integrar dados dinâmicos do usuário e dos times vinculados.

```json
{
    "user": {
        "name": "string",
        "email": "string",
        "avatar": "string (url)"
    },
    "teams": [
        {
            "name": "string",
            "logo": "React.Component",
            "plan": "string"
        }
    ],
    "navMain": [
        {
            "title": "string",
            "url": "string",
            "icon": "React.Component",
            "screenKey": "string (optional)",
            "items": [
                {
                    "title": "string",
                    "url": "string",
                    "screenKey": "string (optional)"
                }
            ]
        }
    ]
}
```

### Validações e Comportamentos

1. **Domínio Dinâmico**: O Sidebar recupera o `domain` via `useParams`. Todas as rotas geradas no menu são prefixadas com `/[domain]/` para garantir a navegação dentro do contexto do cliente.
2. **Estado Colapsável**: Utiliza a propriedade `collapsible="icon"` para otimizar espaço em telas menores ou por preferência do usuário.
3. **Controle de Acesso (Redis/Permissions)**: O Sidebar realiza a filtragem dos itens de menu com base nas permissões do usuário armazenadas no Redis:
    - Itens com `screenKey`: O sistema verifica se o usuário possui a permissão `VIEW` para a respectiva chave (ex: `general`, `users`). Se não houver permissão, o item é ocultado.
    - Itens sem `screenKey`: Telas que não requerem permissão específica ou que são universais (ex: `Dashboard`) são exibidas para todos os usuários autenticados.
    - Submenus: Se todos os itens de um subgrupo (ex: `Settings`) forem filtrados por falta de permissão, o grupo pai também deve ser ocultado.
4. **Mapeamento de Ícones**: Os ícones são importados da biblioteca `lucide-react` e mapeados no arquivo `lib/sidebar.ts`.
5. **Hierarquia de Menu**: Suporta submenus (collapsible items) para agrupar configurações relacionadas (ex: Settings, Parameters).

### I18N

O Sidebar utiliza a seção `sidebar` do dicionário para traduzir os nomes dos grupos e itens de navegação.

```json
{
  "sidebar": {
    "groups": {
      "platform": "string",
      "projects": "string"
    },
    "nav_main": {
      "dashboard": "string",
      "settings": "string",
      "general": "string",
      "teams": "string",
      "parameters": "string",
      "screen_parameters": "string",
      "access_profiles": "string",
      "users": "string"
    }
  }
}
```

## Outras Considerações

- Declare os types referente ao sidebar em `types/sidebar.ts`.
- A lógica de construção da estrutura de dados do menu deve residir em `lib/sidebar.ts`.
- Ícones novos devem ser adicionados ao mapeamento centralizado para manter a consistência visual.
- **Segurança**: A filtragem visual no Sidebar não substitui a necessidade de validação de permissões no backend para cada rota e endpoint da API.
