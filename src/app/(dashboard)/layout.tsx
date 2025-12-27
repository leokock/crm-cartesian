import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { AuthProvider } from '@/components/providers/auth-provider'
import { QueryProvider } from '@/components/providers/query-provider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto bg-muted/30 p-6">
              {children}
            </main>
          </div>
        </div>
      </AuthProvider>
    </QueryProvider>
  )
}
