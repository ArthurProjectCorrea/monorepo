
## Auth Layout

O Layout de autenticação é compartilhado entre todas as telas do grupo `(auth)`, como Sign-in, Forgot Password e Reset Password. Ele define a estrutura visual de duas colunas em desktops, incluindo elementos de branding, troca de idioma, tema e animações visuais.

### Objeto esperado

Diferente das páginas de conteúdo, o layout não consome um objeto de dados da API, mas depende de variáveis de ambiente e do dicionário de traduções.

```json
{
    "env": {
        "NEXT_PUBLIC_APP_NAME": "string"
    },
    "dictionary_dependencies": [
        "locale_switcher",
        "theme_toggle",
        "footer",
        "auth"
    ]
}
```

### Validações e Comportamentos

1. **Validação de Locale**: O layout verifica se o idioma na URL é válido através da função `hasLocale(lang)`. Caso contrário, retorna null para evitar renderização incorreta.
2. **Typewriter Animation**: No lado visual (desktop), o componente `Typewriter` consome um array de frases vindas de `dict.auth.typewriter_phrases`.
3. **Legal Drawers**: O rodapé contém drawers para "Privacy Terms" e "System Policies", que carregam o conteúdo estático definido no dicionário.
4. **Dynamic Branding**: O nome da aplicação no rodapé é injetado via variável de ambiente `NEXT_PUBLIC_APP_NAME`.

### I18N

O layout depende de várias seções do dicionário para compor os elementos globais da interface de autenticação.

```json
{
    "common":{
      "components": {
          "locale_switcher": {
            "label": "string",
            "en": "string"
          },
          "theme_toggle": {
            "label": "string",
            "light": "string",
            "dark": "string",
            "system": "string"
          }
      }
    },
    "auth_layout": {
      "footer": {
        "rights": "string (ex: © {year} {name})",
        "privacy_terms": "string",
        "system_policies": "string",
        "close": "string",
        "privacy_content": "string",
        "policies_content": "string"
      },
        "typewriter_phrases": [
            "string",
            "string",
            "string"
        ]
  }
}
```

## Outras Considerações

- O layout utiliza classes utilitárias do Tailwind para o efeito de gradiente animado e profundidade (mesh gradients).
- O `AuthDrawer` é um componente reutilizável para exibir conteúdos longos sem sair do contexto de autenticação.
- Toda a lógica de tradução é carregada no lado do servidor (Server Component).
