import type { ApiErrorPayload } from '@/types/api'

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

export class ApiRequestError extends Error {
  status: number
  code?: string
  details?: unknown
  requestId?: string

  constructor(
    message: string,
    options: {
      status: number
      code?: string
      details?: unknown
      requestId?: string
    },
  ) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = options.status
    this.code = options.code
    this.details = options.details
    this.requestId = options.requestId
  }
}

function getApiBaseUrl() {
  const value = process.env.EXTERNAL_API_BASE_URL

  if (!value) {
    throw new Error('Missing EXTERNAL_API_BASE_URL in environment variables.')
  }

  return value.replace(/\/$/, '')
}

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    return null
  }

  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}${path}`
  const headers = new Headers(options.headers)

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  const hasBody = options.body !== undefined
  const isFormData = options.body instanceof FormData

  if (hasBody && !headers.has('Content-Type') && !isFormData) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: isFormData
      ? (options.body as FormData)
      : hasBody
        ? JSON.stringify(options.body)
        : undefined,
    cache: 'no-store',
  })

  // Global Terminal Logging
  console.log(`[API] ${options.method || 'GET'} ${path} -> ${response.status}`)

  const payload = await parseJsonSafe<ApiErrorPayload & T>(response)

  if (!response.ok) {
    if (payload?.error) {
      console.error(
        `[API ERROR] ${options.method || 'GET'} ${path}:`,
        JSON.stringify(payload.error, null, 2),
      )
    }
    throw new ApiRequestError(payload?.error?.message ?? 'API request failed.', {
      status: response.status,
      code: payload?.error?.code,
      details: payload?.error?.details,
      requestId: payload?.error?.request_id,
    })
  }

  return (payload ?? ({} as T)) as T
}

export const api = {
  get: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  del: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
