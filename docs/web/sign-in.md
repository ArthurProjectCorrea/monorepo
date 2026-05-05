
## Sign In

### Objeto esperado

O Objeto de sign-in deve retornar um token para ser guardado em cookies e poder ser usado para validação de autenticação e recovery session, nesse caso o nome do cookie deve ser sempre `auth_access_token` e o tempo de vida deve ser o determinado em ENV. Apos o sign-in bem sucedido  a API deve consultar `/api/me` e guardar o objeto do usuário no redis junto com a seção ativa do usuário para que possa ser utilizada durante o uso da Aplicação, sempre que renovar a seção deve recarregar os dados do usuário no redis. O Sign-out deve apagar os dados do usuário no redis e também o cookie `auth_access_token`.

```json
{
    "auth_access_token": {
        "token": "string",
        "expires_in": "number",
        "refresh_token": "string",
        "refresh_expires_in": "number"
    }
}
```

```json
{
    "me": {
        "id": "guid",
        "name": "string",
        "email": "string",
        "client": {
            "id": "guid",
            "name": "string",
            "domain": "string",
            "is_active": "boolean"
        },
        "is_active": "boolean",
        "created_at": "string",
        "updated_at": "string",
        "accesses": [
            {
                "team": {
                    "id": "guid",
                    "name": "string",
                    "is_active": "boolean",
                    "access_profiles": [
                        {
                            "id": "guid",
                            "name": "string",
                            "is_active": "boolean",
                            "permissions": [
                                {
                                    "screen_id": "guid",
                                    "action_id": "guid"
                                },
                                "..."
                            ]
                        },
                        "..."
                    ]
                }
            },
            "..."
        ]
    }
}
```

OBS: Identificamos que salvar o `me` inteiro em cokies não é adeguada pois ele é um objeto muito grande, então como alternativa escolhemos salvar no redis para poder ser reaproveitado pelo web e pela API de maneira mais rapida, utilize o `auth_access_token` para fazer a consulta e recuperar o objeto do usuário.

### Validações Page sign-in/page.tsx
1. Verifique se as credenciais são validas consultando a API
- Se sim: Redirecione para a página `app/[lang]/[domain]/dashboard/page.tsx`
- Se não: Exiba uma mensagem de erro referente ao http_status 401

### I18N

O json abaixo dita exatamente quais as variaveis que essa page deve ter no arquivo de i18n. Lembre-se que as variaveis em common são textos genericos e que serão reutilizados em diferentes pages. Declare todos os types e interceptores referente ao i18n em types/i18n.ts.

```json
{
  "common":{
    "notifications": {
      "http_status": {
        "500": "string"
      }
    }
  },
  "sign_in": {
    "notifications": {
      "http_status": {
        "401": "string",
        "403": "string"
      },
      "success_sign_in": "string",
      "error_sign_in": "string"
    },
    "form": {
      "cards": {
        "information": {
          "title": "string",
          "description": "string"
        }
      },
      "email": {
        "label": "string",
        "placeholder": "string"
      },
      "password": {
        "label": "string",
        "placeholder": "string"
      },
      "forgot_password": {
        "label": "string"
      },
      "submit": {
        "label": "string",
        "loading_text": "string"
      }
    }
  },
  "sign_out": {
    "notifications": {
      "success_sign_out": "string"
    }
  }
}
```

## Outras Considerações

- Declare os types referente a api em `types/api.ts`
- Toda a Logica e Validações da parte de web deve ser feita no arquivo `lib/actions/sign-in.ts`
- **Segurança**: O cookie `auth_access_token` deve ser configurado com as flags `HttpOnly`, `Secure` e `SameSite=Lax` para proteção contra ataques XSS e CSRF.