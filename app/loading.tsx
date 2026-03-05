/**
 * app/loading.tsx — Root-level loading UI
 *
 * Next.js App Router automatically wraps every page in a Suspense
 * boundary.  When a page is being fetched/rendered on the server,
 * Next.js shows this file's default export as an instant fallback.
 *
 * No 'use client' needed — this is a Server Component that simply
 * renders the client PageLoader.
 */
import { PageLoader } from '@/components/ui/page-loader'

export default function RootLoading() {
  return <PageLoader />
}
