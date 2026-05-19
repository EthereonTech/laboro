import { Sidebar } from '@/components/Sidebar'
import { AuthGuard } from '@/components/AuthGuard'

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredType="worker">
      <div className="flex h-screen overflow-hidden">
        <Sidebar type="worker" />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </AuthGuard>
  )
}
