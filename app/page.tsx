import { redirect } from 'next/navigation'

/**
 * Root page — immediately redirects to /dashboard.
 * Middleware handles the auth check:
 *   - Authenticated  → /dashboard renders normally
 *   - Unauthenticated → middleware redirects to /login
 */
export default function RootPage() {
  redirect('/dashboard')
}
