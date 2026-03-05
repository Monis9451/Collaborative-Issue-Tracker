/**
 * app/(auth)/loading.tsx
 *
 * Shown while auth pages (login, register) are loading.
 * Keeps the centered layout feel — just the spinner, no sidebar.
 */
import { Spinner } from '@/components/ui/spinner'

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <Spinner size="lg" label="Loading page…" />
    </div>
  )
}
