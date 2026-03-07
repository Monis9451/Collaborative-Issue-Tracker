import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * proxy.ts — Next.js 16 edge proxy (replaces middleware.ts).
 *
 * Next.js 16 renamed the convention from `middleware` → `proxy`.
 * The exported function must be named `proxy` and the file must be
 * `proxy.ts` at the project root.
 *
 * Responsibilities:
 *  1. Refresh the Supabase session cookie on every request.
 *  2. Redirect unauthenticated users hitting /dashboard → /login.
 *  3. Redirect authenticated users hitting /login or /register → /dashboard.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ⚠️  Do NOT add any logic between createServerClient and getUser().
  //     getUser() must run immediately to refresh the session token.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Routes that require an authenticated session
  const isProtectedRoute = pathname.startsWith('/dashboard')

  // Routes that should be inaccessible once logged in
  const isAuthRoute =
    pathname.startsWith('/login') || pathname.startsWith('/register')

  // Unauthenticated user tries to access a protected page → /login
  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Authenticated user lands on an auth page → /dashboard
  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
