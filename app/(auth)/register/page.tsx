import { AuthSplitCard } from '@/components/auth/AuthSplitCard'
import { RegisterForm } from '@/components/auth/RegisterForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account — Collaborative Issue Tracker',
}

export default function RegisterPage() {
  return (
    <AuthSplitCard
      formTitle="Create Account"
      ctaTitle="Welcome Back!"
      ctaSubtitle="Already have an account? Sign in to stay connected with your team and your projects."
      ctaButtonLabel="Sign In"
      ctaButtonHref="/login"
      ctaPosition="left"
    >
      <RegisterForm />
    </AuthSplitCard>
  )
}
