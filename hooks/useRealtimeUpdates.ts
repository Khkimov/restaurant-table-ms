'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { pusherClient } from '@/lib/pusher'

export function useRealtimeUpdates() {
  const router = useRouter()

  useEffect(() => {
    const channel = pusherClient.subscribe('restaurant-updates')
    
    channel.bind('table-updated', () => {
      router.refresh()
    })
    
    channel.bind('reservation-updated', () => {
      router.refresh()
    })

    return () => {
      pusherClient.unsubscribe('restaurant-updates')
    }
  }, [router])
}
