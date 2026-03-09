import { AuthCard } from '@/components/auth/AuthCard'
import { AuthFooterLink } from '@/components/auth/AuthFooterLink'
import { CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confirm Your Email — Collaborative Issue Tracker',
}

export default function ConfirmEmailPage() {
  return (
    <AuthCard title="Check Your Email">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-text-secondary">
            We&apos;ve sent a confirmation link to your email address.
            Click the link to activate your account and get started.
          </p>
          <p className="text-xs text-text-muted">
            Didn&apos;t receive it? Check your spam folder.
          </p>
        </div>

        <AuthFooterLink
          prompt="Already confirmed?"
          label="Sign in"
          href="/login"
        />
      </div>
    </AuthCard>
  )
}
