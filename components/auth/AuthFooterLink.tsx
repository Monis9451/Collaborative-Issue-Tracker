import Link from 'next/link'

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
