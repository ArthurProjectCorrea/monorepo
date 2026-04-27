# Configuração e Uso de Dicionários (i18n)

Este documento explica como utilizar o sistema de internacionalização (i18n) baseado em dicionários JSON no projeto.

## Estrutura de Arquivos

- `dictionaries/en.json`: Traduções em Inglês.
- `dictionaries/pt.json`: Traduções em Português.
- `app/[lang]/dictionaries.ts`: Utilitário para carregar os arquivos JSON no servidor.

## 1. Adicionando Traduções

Sempre adicione as chaves em **ambos** os arquivos (`en.json` e `pt.json`) para manter a consistência.

```json
// dictionaries/pt.json
{
  "home": {
    "title": "Bem-vindo"
  }
}
```

## 2. Uso em Pages (Server Components)

As páginas dentro de `app/[lang]` recebem o parâmetro `lang` automaticamente. Use a função `getDictionary` para carregar as traduções no servidor.

```tsx
// app/[lang]/page.tsx
import { getDictionary } from './dictionaries'

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <h1>{dict.home.title}</h1>
}
```

## 3. Uso em Componentes (Client Components)

Componentes cliente não devem carregar o dicionário diretamente (para evitar o envio de todos os arquivos de tradução para o navegador). Em vez disso, passe as traduções necessárias via **props** a partir de uma Page ou Layout (Server Component).

### Passo A: Definir a Interface no Componente Cliente

```tsx
// components/my-component.tsx
"use client"

interface MyComponentProps {
  dict: {
    title: string
  }
}

export function MyComponent({ dict }: MyComponentProps) {
  return <button>{dict.title}</button>
}
```

### Passo B: Passar o Dicionário na Page

```tsx
// app/[lang]/page.tsx
import { MyComponent } from "@/components/my-component"
import { getDictionary } from "./dictionaries"

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <MyComponent dict={dict.home} />
}
```

## 4. Adicionando um Novo Idioma

1. Crie o arquivo JSON em `dictionaries/` (ex: `es.json`).
2. Registre o idioma em `app/[lang]/dictionaries.ts`:

```ts
const dictionaries = {
  en: () => import('../../dictionaries/en.json').then((m) => m.default),
  pt: () => import('../../dictionaries/pt.json').then((m) => m.default),
  es: () => import('../../dictionaries/es.json').then((m) => m.default), // Novo
}
```

3. O sistema de roteamento (`proxy.ts`) e a geração de páginas estáticas (`generateStaticParams` no `layout.tsx`) reconhecerão o novo idioma automaticamente.
