
## General

### Objeto esperado

O Objeto sempre deve trazer dados da screen relacionada a page nesse caso seria a screens key `general`, depois vem o data para preencher os dados do form.

```json
{
    "screen_general": {
        "id": "guid",
        "description": "string",
        "key": "general",
    },
    "data": {
        "id": "guid",
        "name": "string",
        "domain": "string",
        "description": "string",
        "is_active": "boolean"
    }
}
```

### Validações Page general/page.tsx
0. Verificar se o Usuário esta Autenticado.
1. Verificar no redis se o usuário tem a permissão VIEW para a screen general
- Se sim: carrega a pagina `app/[lang]/[domain]/settings/general/page.tsx`
- Se não: chama o `forbidden()`
2. Verificar no redis se o usuário tem a permissão UPDATE para a screen general
- Se sim: Permite que os inputs sejam editaveis e o botão save seja habilitado.
- Se não: Mantem os inputs desabilitados e o botão save desabilitado.


### I18N

O objeto de i18n sempre deve trazer dados deve usar o nome key da page, nesse caso seria a screens key `general`, o json abaixo dita exatamente quais as variaveis que essa page deve ter no arquivo de i18n. lembrando que as variaveis em common são textos genericos e que serão reutilizados em diferentes pages. Declare todos os types e interceptores referente ao i18n em types/i18n.ts.

```json
{
  "common":{
    "breadcrumb": {
      "settings": "string"
    },
    "form": {
      "is_active": {
        "label": "string"
      },
      "actions": {
        "save": "string",
        "saving": "string",
        "discard": "string"
      }
    },
    "notifications": {
      "http_status": {
        "403": "string",
        "500": "string"
      },
      "success_update": "string"
    },
    "components": {
      "input_upload": {
        "title": "string",
        "title_dragging": "string",
        "description_single": "string",
        "description_multiple": "string",
        "browse": "string",
        "aria_label": "string",
        "aria_upload_area": "string",
        "aria_remove": "string",
        "replace": "string",
        "remove": "string",
        "error_max_files": "string",
        "error_max_files_plural": "string",
        "error_size": "string",
        "error_size_plural": "string"
      }
    }
  },
  "general": {
    "form": {
      "cards": {
        "information": {
          "title": "string",
          "description": "string"
        },
        "upload": {
          "title": "string",
          "description": "string"
        }
      },
      "name": {
        "label": "string",
        "placeholder": "string",
        "description": "string"
      },
      "domain": {
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
- Toda a Logica e Validações da parte de web deve ser feita no arquivo `lib/actions/general.ts`