import * as React from 'react'

export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState<boolean>(true)

  React.useEffect(() => {
    const result = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => {
      setValue(event.matches)
    }

    result.addEventListener('change', onChange)
    setValue(result.matches)

    return () => result.removeEventListener('change', onChange)
  }, [query])

  return value
}
