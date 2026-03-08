'use client'

import { useState, useEffect } from 'react'

/**
 * Returns true when the viewport is below the Tailwind `md` breakpoint (768px).
 * Initialises to false (SSR-safe) then updates on the client after mount.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    const mq = window.matchMedia('(max-width: 767px)')
    mq.addEventListener('change', check)
    return () => mq.removeEventListener('change', check)
  }, [])

  return isMobile
}
