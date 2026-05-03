'use server'

export async function logToTerminal(message: string, type: 'info' | 'warn' | 'error' = 'info') {
  const timestamp = new Date().toLocaleTimeString()
  const prefix = `[NOTIFICATION ${type.toUpperCase()}]`

  if (type === 'error') {
    console.error(`${timestamp} ${prefix} ${message}`)
  } else if (type === 'warn') {
    console.warn(`${timestamp} ${prefix} ${message}`)
  } else {
    console.log(`${timestamp} ${prefix} ${message}`)
  }
}
