## Access Profiles

### Objeto esperado

O Objeto sempre deve trazer dados da screen relacionada a page nesse caso seria a screens key `access_profiles`, depois vem o data para construir o data table e para preencher os dados em update, e em other dados de tabelas relacionadas para preenchimentos de selects e etc.

```json
{
    "screen_access_profiles": {
        "id": "guid",
        "description": "string",
        "key": "access_profiles",
    },
    "data": [
        {
            "id": "guid",
            "name": "string",
            "description": "string",
            "is_active": "boolean",
            "created_at": "string",
            "updated_at": "string",
            "accesses": [
                {
                    "screen_id": "guid",
                    "action_id": "guid"
                },
                "..."
            ]
        },
        "..."
    ],
    "other": {
        "actions": [
            {
                "id": "guid",
                "name": "string",
                "key": "string"
            }
        ],
        "screens": [
            {
                "id": "guid",
                "name": "string",
                "key": "string"
            }
        ]
    }
}
```

### Validações Page access-profiles/page.tsx
0. Verificar se o Usuário esta Autenticado.
1. Verificar no redis se o usuário tem a permissão VIEW para a screen access_profiles
- Se sim: carrega a pagina `app/[lang]/[domain]/settings/access-profiles/page.tsx`
- Se não: chama o `forbidden()`
2. Verificar no redis se o usuário tem a permissão CREATE para a screen access_profiles
- Se sim: Retorna true para o botão create do data table.
- Se não: Retorna false para o botão create do data table.
3. Verificar no redis se o usuário tem a permissão UPDATE para a screen access_profiles
- Se sim: Retorna true para o botão update do data table.
- Se não: Retorna false para o botão update do data table.
4. Verificar no redis se o usuário tem a permissão DELETE para a screen access_profiles
- Se sim: Retorna true para o botão delete do data table.
- Se não: Retorna false para o botão delete do data table.

### Validações Page access-profiles/new/page.tsx
0. Verificar se o Usuário esta Autenticado.
1. Verificar no redis se o usuário tem a permissão CREATE e VIEW para a screen access_profiles
- Se sim: carrega a pagina `app/[lang]/[domain]/settings/access-profiles/new/page.tsx`
- Se não: chama o `forbidden()`

### Validações Page access-profiles/[id]/page.tsx
0. Verificar se o Usuário esta Autenticado.
1. Verificar no redis se o usuário tem a permissão UPDATE e VIEW para a screen access_profiles
- Se sim: carrega a pagina `app/[lang]/[domain]/settings/access-profiles/[id]/page.tsx`
- Se não: chama o `forbidden()`


### I18N

O objeto de i18n sempre deve trazer dados deve usar o nome key da page, nesse caso seria a screens key `access_profiles`, o json abaixo dita exatamente quais as variaveis que essa page deve ter no arquivo de i18n. lembrando que as variaveis em common são textos genericos e que serão reutilizados em diferentes pages. Declare todos os types e interceptores referente ao i18n em types/i18n.ts.

```json
{
  "common":{
    "breadcrumb": {
      "settings": "string"
    },
    "table": {
      "status_active": "string",
      "status_inactive": "string",
      "view_more": "string",
      "view_less": "string",
      "no_results": "string",
      "search_placeholder": "string",
      "next_button": "string",
      "previous_button": "string",
      "rows_per_page": "string",
      "selected_rows": "string",
      "column_actions": "string",
      "column_status": "string",
      "column_updated_at": "string",
      "actions": {
        "update": "string",
        "delete": "string",
        "refresh": "string",
        "create": "string"
      }
    },
    "form": {
      "is_active": {
        "label": "string"
      },
      "actions": {
        "save": "string",
        "saving": "string",
        "discard": "string",
        "back": "string"
      }
    },
    "dialogs": {
      "delete_confirm": {
        "title": "string",
        "description": "string",
        "confirm": "string",
        "cancel": "string"
      }
    },
    "notifications": {
      "http_status": {
        "403": "string",
        "500": "string"
      },
      "success_update": "string",
      "success_create": "string",
      "success_delete": "string"
    }
  },
  "access_profiles": {
    "table": {
      "column_name": "string",
      "column_description": "string"
    },
    "form": {
      "cards": {
        "information": {
          "title": "string",
          "description": "string"
        },
        "permissions": {
          "title": "string",
          "description": "string"
        }
      },
      "name": {
        "label": "string",
        "placeholder": "string",
        "description": "string"
      },
      "description": {
        "label": "string",
        "placeholder": "string",
        "description": "string"
      },
      "is_active": {
        "description": "string"
      },
      "table_permissions": {
        "column_screens": "string",
        "add_button": "string",
        "select_screen_placeholder": "string",
        "permission_view": "string",
        "permission_create": "string",
        "permission_update": "string",
        "permission_delete": "string"
      }
    }
  }
}
```
## Outras Considerações

- Declare os types referente a api em `types/api.ts`
- Toda a Logica e Validações da parte de web deve ser feita no arquivo `lib/actions/access-profiles.ts`
- **Segurança**: As permissões filtradas no frontend (VIEW, CREATE, etc.) devem ser obrigatoriamente validadas na API para cada endpoint.