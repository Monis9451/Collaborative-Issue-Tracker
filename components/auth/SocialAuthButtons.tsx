'use client'

// ─────────────────────────────────────────────────────────────
//  SocialAuthButtons — Google, Apple, and X (Twitter) sign-in.
//  OAuth providers must be enabled in Supabase Dashboard first.
//  Currently DISABLED — showing "Coming Soon" state.
// ─────────────────────────────────────────────────────────────

interface SocialButtonProps {
  children:  React.ReactNode
  ariaLabel: string
}

function SocialButton({ children, ariaLabel }: SocialButtonProps) {
  return (
    <div className="relative" title="Coming Soon">
      <button
        type="button"
        disabled
        aria-label={ariaLabel}
        className="flex h-11 w-11 cursor-not-allowed items-center justify-center rounded-full
                   bg-text-primary/30 text-surface/60 shadow-sm
                   ring-1 ring-border
                   transition-opacity"
      >
        {children}
      </button>
    </div>
  )
}

export function SocialAuthButtons() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full items-center gap-3">
        <hr className="flex-1 border-border" />
        <span className="text-xs font-medium text-text-muted">
          Or Sign in with
        </span>
        <hr className="flex-1 border-border" />
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-4">
          {/* Google */}
          <SocialButton ariaLabel="Sign in with Google (coming soon)">
            <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-50" aria-hidden="true">
              <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#ffffffcc" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#ffffff99" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#ffffffbb" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </SocialButton>

          {/* Apple */}
          <SocialButton ariaLabel="Sign in with Apple (coming soon)">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white/50" aria-hidden="true">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          </SocialButton>

          {/* X (Twitter) */}
          <SocialButton ariaLabel="Sign in with X (coming soon)">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white/50" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </SocialButton>
        </div>

        {/* Coming Soon badge */}
        <span className="inline-flex items-center gap-1 rounded-full bg-jira-blue-light px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-jira-blue-dark">
          <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current" aria-hidden="true">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 9.75h-1.5v-1.5h1.5v1.5zm0-3h-1.5v-4h1.5v4z" />
          </svg>
          Coming Soon
        </span>
      </div>
    </div>
  )
}
