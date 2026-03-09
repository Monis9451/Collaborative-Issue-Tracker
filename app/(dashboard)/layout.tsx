import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/actions'
import { type ReactNode } from 'react'
import { DashboardHeader } from '@/components/dashboard/layout/DashboardHeader'

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getAuthUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen flex-col bg-bg overflow-hidden">
      <DashboardHeader />
      <main className="flex flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
