# Comunicação com API via Server Actions

Este documento explica como utilizar Server Actions para realizar chamadas à API, gerenciar estados de formulários e lidar com autenticação no projeto.

## Por que usar Server Actions?

- **Segurança**: As chamadas à API ocorrem no servidor, protegendo segredos e tokens.
- **Simplicidade**: Integração direta com formulários HTML e o estado da UI.
- **Redução de JS no Cliente**: Menos código de "fetch" e tratamento de erros enviado para o navegador.

## 1. Definindo uma Action

As actions devem ser criadas em arquivos com a diretiva `'use server'`. No projeto, elas ficam localizadas em `apps/web/lib/action/`.

### Exemplo de Action (`lib/action/sign-in.ts`)

```tsx
'use server'

import { cookies } from 'next/headers'
import { api, ApiRequestError } from '@/lib/api'
import { AUTH_SESSION_COOKIE } from '@/lib/auth-session'
import type { SignInActionState, SignInRequest, SignInResponse } from '@/types'

export async function signInAction(
  _previousState: SignInActionState,
  formData: FormData,
): Promise<SignInActionState> {
  // 1. Extrair dados do FormData
  const identifier = formData.get('identifier') as string
  const password = formData.get('password') as string

  // 2. Validação básica no servidor
  if (!identifier || !password) {
    return {
      status: 'error',
      fieldErrors: { identifier: 'Campos obrigatórios' },
      httpStatus: 400,
      notificationToken: crypto.randomUUID(),
    }
  }

  try {
    // 3. Chamada à API centralizada
    const response = await api.post<SignInResponse>('/v1/auth/sign-in', {
      identifier,
      password,
    })

    // 4. Gestão de Cookies (ex: Autenticação)
    const cookieStore = await cookies()
    cookieStore.set(AUTH_SESSION_COOKIE, response.session.session_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: response.session.expires_in,
    })

    return {
      status: 'success',
      nextStep: 'authenticated',
      httpStatus: 200,
      notificationToken: crypto.randomUUID(),
    }
  } catch (error) {
    // 5. Tratamento de erro da API
    if (error instanceof ApiRequestError) {
      return {
        status: 'error',
        httpStatus: error.status,
        notificationToken: crypto.randomUUID(),
      }
    }
    return { status: 'error', httpStatus: 500, notificationToken: crypto.randomUUID() }
  }
}
```

## 2. Uso em Componentes (Client Components)

Utilizamos o hook `useActionState` (ou `useFormState` em versões anteriores) para conectar a action ao formulário.

### Exemplo de Formulário (`components/forms/sign-in-form.tsx`)

```tsx
'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { signInAction } from '@/lib/action/sign-in'
import { initialSignInState } from '@/lib/action/sign-in-state'

export function SignInForm() {
  // Conecta a action e recebe o estado e a função de disparo
  const [state, formAction, isPending] = useActionState(signInAction, initialSignInState)

  return (
    <form action={formAction}>
      <input name="identifier" type="email" disabled={isPending} />
      {state.fieldErrors?.identifier && <span>{state.fieldErrors.identifier}</span>}
      
      <input name="password" type="password" disabled={isPending} />
      
      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Carregando...' : 'Entrar'}
    </button>
  )
}
```

## 3. Lidando com Efeitos Colaterais

Para redirecionamentos ou notificações baseadas no resultado da action, utilize `useEffect` monitorando o `state` ou o `notificationToken`.

```tsx
React.useEffect(() => {
  if (state.status === 'success' && state.nextStep === 'authenticated') {
    router.push('/dashboard')
  }
}, [state])
```

## Referências Oficiais

- [Next.js: Forms and Mutations](https://nextjs.org/docs/app/api-reference/components/form)
- [Next.js: Authentication Guide](https://nextjs.org/docs/app/guides/authentication)
- [React: useActionState](https://react.dev/reference/react/useActionState)
