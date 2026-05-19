import { Sidebar } from '@/components/Sidebar'
import { AuthGuard } from '@/components/AuthGuard'

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredType="business">
      <div className="flex h-screen overflow-hidden">
        <Sidebar type="business" />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </AuthGuard>
  )
}
