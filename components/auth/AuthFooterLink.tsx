import Link from 'next/link'

// ─────────────────────────────────────────────────────────────
//  AuthFooterLink — the "Don't have an account? Register" /
//  "Already have an account? Sign in" link at the bottom of
//  each auth card. Keeps the repetitive pattern in one place.
// ─────────────────────────────────────────────────────────────

interface AuthFooterLinkProps {
  prompt: string
  label:  string
  href:   string
}

export function AuthFooterLink({ prompt, label, href }: AuthFooterLinkProps) {
  return (
    <p className="text-center text-sm text-text-secondary">
      {prompt}{' '}
      <Link
        href={href}
        className="font-semibold text-jira-blue hover:text-jira-blue-hover hover:underline"
      >
        {label}
      </Link>
    </p>
  )
}
