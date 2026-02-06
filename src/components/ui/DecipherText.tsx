import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

interface DecipherTextProps {
  text: string
  className?: string
  reveal?: boolean
  speed?: number
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+'

export default function DecipherText({
  text,
  className = '',
  reveal = true,
  speed = 50,
}: DecipherTextProps) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    if (!reveal) return

    let iteration = 0
    let interval: NodeJS.Timeout

    const startDeciphering = () => {
      interval = setInterval(() => {
        setDisplayText((current) => {
          return text
            .split('')
            .map((char, index) => {
              if (index < iteration) {
                return text[index]
              }
              return CHARS[Math.floor(Math.random() * CHARS.length)]
            })
            .join('')
        })

        if (iteration >= text.length) {
          clearInterval(interval)
        }

        iteration += 1 / 3
      }, speed)
    }

    startDeciphering()

    return () => clearInterval(interval)
  }, [text, reveal, speed])

  return (
    <motion.span
      className={`inline-block font-mono ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {displayText}
    </motion.span>
  )
}
