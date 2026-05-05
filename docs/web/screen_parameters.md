
## Screen Parameters

O Objeto sempre deve trazer dados da screen relacionada a page nesse caso seria a screens key `screen_parameters`, depois vem o data para construir o data table e para preencher os dados em update.

```json
{
    "screen_screen_parameters": {
        "id": "guid",
        "description": "string",
        "key": "screen_parameters",
    },
    "data": [
        {
            "id": "guid",
            "name": "string",
            "description": "string",
            "screen_key": "string",
            "is_active": "boolean",
            "created_at": "string",
            "updated_at": "string"
        },
        "..."
    ]
}
```

### Validações Page screens/page.tsx
0. Verificar se o Usuário esta Autenticado.
1. Verificar no redis se o usuário tem a permissão VIEW para a screen screen_parameters
- Se sim: carrega a pagina `app/[lang]/[domain]/parameters/screens/page.tsx`
- Se não: chama o `forbidden()`
2. Verificar no redis se o usuário tem a permissão UPDATE para a screen screen_parameters
- Se sim: Retorna true para o botão update do data table.
- Se não: Retorna false para o botão update do data table.

### I18N

O objeto de i18n sempre deve trazer dados deve usar o nome key da page, nesse caso seria a screens key `screen_parameters`, o json abaixo dita exatamente quais as variaveis que essa page deve ter no arquivo de i18n. lembrando que as variaveis em common são textos genericos e que serão reutilizados em diferentes pages. Declare todos os types e interceptores referente ao i18n em types/i18n.ts.

```json
{
  "common":{
    "breadcrumb": {
      "parameters": "string"
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
        "refresh": "string"
      }
    },
    "form": {
      "is_active": {
        "label": "string"
      }
    },
    "dialogs": {
      "update_dialog": {
        "title": "string",
        "description": "string",
        "discard": "string",
        "save": "string"
      }
    },
    "notifications": {
      "http_status": {
        "403": "string",
        "500": "string"
      },
      "success_update": "string",
    }
  },
  "screen_parameters": {
    "table": {
      "column_key": "string",
      "column_title": "string",
      "column_description": "string",
    },
    "form": {
      "title": {
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
      }
    }
  }
}
```

## Outras Considerações

- Declare os types referente a api em `types/api.ts`
- Toda a Logica e Validações da parte de web deve ser feita no arquivo `lib/actions/screen_parameters.ts`