'use client'

import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'

interface RealtimeProviderProps {
  children: React.ReactNode
}

export default function RealtimeProvider({ children }: RealtimeProviderProps) {
  useRealtimeUpdates()
  return <>{children}</>
}
