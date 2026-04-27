'use client'

import * as React from 'react'

interface TypewriterProps {
  phrases: string[]
  speed?: number
  delay?: number
}

export function Typewriter({ phrases, speed = 100, delay = 2000 }: TypewriterProps) {
  const [displayText, setDisplayText] = React.useState('')
  const [phraseIndex, setPhraseIndex] = React.useState(0)
  const [charIndex, setCharIndex] = React.useState(0)
  const [isDeleting, setIsDeleting] = React.useState(false)

  React.useEffect(() => {
    const currentPhrase = phrases[phraseIndex]

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          setDisplayText(currentPhrase.substring(0, charIndex + 1))
          setCharIndex(prev => prev + 1)

          if (charIndex === currentPhrase.length) {
            // Finished typing, wait before deleting
            setTimeout(() => setIsDeleting(true), delay)
          }
        } else {
          // Deleting
          setDisplayText(currentPhrase.substring(0, charIndex - 1))
          setCharIndex(prev => prev - 1)

          if (charIndex === 0) {
            setIsDeleting(false)
            setPhraseIndex(prev => (prev + 1) % phrases.length)
          }
        }
      },
      isDeleting ? speed / 2 : speed,
    )

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, phraseIndex, phrases, speed, delay])

  return (
    <div className="flex h-full w-full items-center justify-center">
      <h1 className="text-3xl font-bold text-white md:text-4xl min-h-[1.2em]">
        {displayText}
        <span className="ml-1 inline-block w-1 h-8 bg-white animate-pulse align-middle" />
      </h1>
    </div>
  )
}
