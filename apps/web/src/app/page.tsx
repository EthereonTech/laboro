'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export default function RootPage() {
  const router = useRouter()
  const { user, isLoading, loadSession } = useAuthStore()

  useEffect(() => { loadSession() }, [loadSession])

  useEffect(() => {
    if (isLoading) return
    if (!user) { router.replace('/login'); return }
    router.replace(user.type === 'business' ? '/business' : '/worker')
  }, [user, isLoading, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-800 border-t-transparent" />
    </div>
  )
}
