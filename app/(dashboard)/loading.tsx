/**
 * app/(dashboard)/loading.tsx
 *
 * Shown while dashboard pages are being fetched.
 * Uses the full overlay variant so the sidebar chrome stays visible
 * underneath while the main content area loads.
 */
import { PageLoader } from '@/components/ui/page-loader'

export default function DashboardLoading() {
  return <PageLoader variant="overlay" message="Loading…" />
}
