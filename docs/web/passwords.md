
## Passwords

### Objeto esperado

O fluxo de recuperação de senha é composto por três etapas principais: solicitação de recuperação (Forgot Password), verificação do código de segurança (Verify OTP) e a definição da nova senha (Reset Password). Cada etapa utiliza objetos específicos para comunicação com a API.

#### Forgot Password

A solicitação de recuperação exige apenas o identificador do usuário.
**Boas práticas:**
- Sempre limitar tentativas por IP/usuário (rate limiting) para evitar brute force.
- Nunca informar se o usuário existe ou não. Sempre retornar a mesma resposta.
- Sempre usar HTTPS.

**Requisição:**
```json
{
  "identifier": "string"
}
```
**Resposta:**
```json
{
  "status": "accepted",
  "expires_in": 900
}
```
**Observações:**
- Nunca exponha se o usuário existe ou não.
- Sempre retorne a mesma resposta para evitar enumeração de usuários.
- O tempo de expiração do código deve ser curto (ex: 15 minutos).

#### Verify OTP

A verificação do código enviado por e-mail retorna um `reset_token` que deve ser usado obrigatoriamente na etapa final de reset.
**Boas práticas:**
- Limitar tentativas de verificação por tempo/IP.
- Sempre invalidar o código após uso ou expiração.

**Requisição:**
```json
{
  "identifier": "string",
  "otp_code": "string"
}
```
**Resposta:**
```json
{
  "reset_token": "string"
}
```
**Observações:**
- O reset_token deve expirar rapidamente (ex: 15-60 minutos).
- Nunca retorne detalhes de erro que permitam deduzir se o código está correto ou não (apenas mensagem genérica).

#### Reset Password

A etapa final exige o identificador, o token de reset obtido na verificação e a nova senha.
**Boas práticas:**
- Validar força da senha (mínimo de caracteres, caracteres especiais, etc).
- Invalidar todos os tokens e sessões anteriores após redefinição.
- Sempre retornar resposta padronizada.

**Requisição:**
```json
{
  "identifier": "string",
  "reset_token": "string",
  "new_password": "string"
}
```
**Resposta:**
```json
{
  "status": "success"
}
```
**Observações:**
- Após redefinir a senha, todas as sessões e tokens antigos devem ser invalidados.

### Validações das Páginas


#### Forgot Password (`app/[lang]/(auth)/forgot-password/page.tsx`)
1. Validar se o e-mail informado é válido.
2. Sempre retornar resposta de sucesso, independente do usuário existir.
3. Implementar rate limiting para evitar abuso.
4. Em caso de sucesso, redirecionar para a página de verificação de OTP (`/verify-otp?identifier=...`).
5. Em caso de erro crítico (ex: falha de conexão), exibir mensagem http_status.500


#### Verify OTP (`app/[lang]/(auth)/verify-otp/page.tsx`)
1. Validar o código de 6 dígitos.
2. Implementar rate limiting para tentativas de verificação.
3. Permitir o reenvio do código (Resend OTP) respeitando o tempo de espera.
4. Em caso de sucesso, redirecionar para a página de reset (`/reset-password?identifier=...&token=...`).


#### Reset Password (`app/[lang]/(auth)/reset-password/page.tsx`)
1. Validar a força da nova senha (requisitos de segurança).
2. Validar se a confirmação de senha é idêntica à nova senha.
3. Invalidar todas as sessões e tokens antigos após redefinição.
4. Em caso de sucesso, redirecionar o usuário para a página de Sign-in.

*Nota: Os tokens de reset devem possuir um tempo de expiração curto (ex: 15-60 minutos) por questões de segurança.*
*Nota: Sempre usar HTTPS em todas as etapas.*

### I18N

O json abaixo dita as variáveis necessárias para as três telas de recuperação de senha. Lembre-se de declarar todos os types em `types/i18n.ts`.

```json
{
  "common": {
    "notifications": {
      "http_status": {
        "500": "string"
      }
    }
  },
  "forgot_password": {
    "notifications": {
      "http_status": {
        "400": "string (Email is required)",
        "500": "string"
      },
      "success_forgot_password": "string (Generic message to avoid enumeration)",
      "error_forgot_password": "string"
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
      "submit": {
        "label": "string",
        "loading_text": "string"
      },
      "back_to_login": {
        "label": "string"
      }
    }
  },
  "verify_otp": {
    "notifications": {
      "http_status": {
        "400": "string (Invalid or required code)"
      },
      "success_verify_otp": "string",
      "error_verify_otp": "string",
      "success_resend_otp": "string"
    },
    "form": {
      "cards": {
        "information": {
          "title": "string",
          "description": "string"
        }
      },
      "otp_code": {
        "label": "string"
      },
      "submit": {
        "label": "string",
        "loading_text": "string"
      },
      "resend": {
        "label": "string"
      },
      "back_to_login": {
        "label": "string"
      }
    }
  },
  "reset_password": {
    "notifications": {
      "http_status": {
        "400": "string (Password mismatch or required)"
      },
      "success_reset_password": "string",
      "error_reset_password": "string"
    },
    "form": {
      "cards": {
        "information": {
          "title": "string",
          "description": "string"
        }
      },
      "password": {
        "label": "string",
        "placeholder": "string"
      },
      "confirm_password": {
        "label": "string",
        "placeholder": "string"
      },
      "submit": {
        "label": "string",
        "loading_text": "string"
      },
      "security_rules": {
        "title": "string",
        "min_chars": "string",
        "number": "string",
        "uppercase": "string",
        "lowercase": "string",
        "special": "string"
      }
    }
  }
}
```

## Outras Considerações

- Declare os types referente a api em `types/api.ts`
- Toda a Logica e Validações da parte de web deve ser feita no arquivo `lib/actions/passwords.ts`