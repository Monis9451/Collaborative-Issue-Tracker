import { AuthSplitCard } from '@/components/auth/AuthSplitCard'
import { LoginForm } from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — Collaborative Issue Tracker',
}

export default function LoginPage() {
  return (
    <AuthSplitCard
      formTitle="Sign In"
      ctaTitle="Hello, Friend!"
      ctaSubtitle="Register with your personal details to use all of the site’s features."
      ctaButtonLabel="Sign Up"
      ctaButtonHref="/register"
    >
      <LoginForm />
    </AuthSplitCard>
  )
}
