'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export function AuthGuard({
  children,
  requiredType,
}: {
  children: React.ReactNode
  requiredType: 'worker' | 'business'
}) {
  const router = useRouter()
  const { user, isLoading, loadSession } = useAuthStore()

  useEffect(() => {
    // Re-lê o token após hidratação do SSR (quando window fica disponível)
    loadSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isLoading) return
    if (!user) { router.replace('/login'); return }
    if (user.type !== requiredType) {
      router.replace(user.type === 'business' ? '/business' : '/worker')
    }
  }, [user, isLoading, requiredType, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-800 border-t-transparent" />
      </div>
    )
  }

  if (!user || user.type !== requiredType) return null

  return <>{children}</>
}
