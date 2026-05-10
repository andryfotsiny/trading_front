import { useEffect, useRef, useState } from 'react'

export function useAnimatedPrice(price: number | undefined) {
  const prevPrice = useRef<number | undefined>(undefined)
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    if (price === undefined) return
    if (prevPrice.current !== undefined && price !== prevPrice.current) {
      setFlash(price > prevPrice.current ? 'up' : 'down')
      const t = setTimeout(() => setFlash(null), 800)
      prevPrice.current = price
      return () => clearTimeout(t)
    }
    prevPrice.current = price
  }, [price])

  const flashClass = flash === 'up'
    ? 'text-emerald-400 transition-colors duration-300'
    : flash === 'down'
    ? 'text-rose-400 transition-colors duration-300'
    : 'text-zinc-100 transition-colors duration-300'

  return { flashClass }
}
