'use client'

import { useState, useEffect } from 'react'

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
