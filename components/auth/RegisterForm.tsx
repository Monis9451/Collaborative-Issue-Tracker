'use client'

import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { registerSchema, type RegisterFormValues } from '@/types/auth'
import { useSignUp } from '@/hooks/useSignUp'
import { fieldVariant, fieldContainerVariant } from '@/components/auth/AuthSplitCard'
import { AnimatedPlaceholderInput } from '@/components/ui/AnimatedPlaceholderInput'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/Alert'

// ─────────────────────────────────────────────────────────────
//  RegisterForm — react-hook-form + Zod + useSignUp mutation.
//  Staggered field animation via framer-motion.
//  Pill-shaped inputs for the split-card auth design.
// ─────────────────────────────────────────────────────────────

export function RegisterForm() {
  const id      = useId()
  const signUp  = useSignUp()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name:        '',
      email:            '',
      password:         '',
      confirm_password: '',
    },
  })

  function onSubmit(values: RegisterFormValues) {
    signUp.mutate({
      email:     values.email,
      password:  values.password,
      full_name: values.full_name,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <motion.div
        variants={fieldContainerVariant}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4"
      >
        {signUp.isError && (
          <motion.div variants={fieldVariant}>
            <Alert variant="error">{(signUp.error as Error).message}</Alert>
          </motion.div>
        )}

        <motion.div variants={fieldVariant}>
          <FormField label="Full Name" htmlFor={`${id}-name`} error={errors.full_name?.message} required>
            <AnimatedPlaceholderInput
              id={`${id}-name`}
              type="text"
              autoComplete="name"
              placeholder="Jane Smith"
              hasError={!!errors.full_name}
              {...register('full_name')}
            />
          </FormField>
        </motion.div>

        <motion.div variants={fieldVariant}>
          <FormField label="E-mail" htmlFor={`${id}-email`} error={errors.email?.message} required>
            <AnimatedPlaceholderInput
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              hasError={!!errors.email}
              {...register('email')}
            />
          </FormField>
        </motion.div>

        <motion.div variants={fieldVariant}>
          <FormField label="Password" htmlFor={`${id}-password`} error={errors.password?.message} hint="Min 8 chars · one uppercase · one number" required>
            <AnimatedPlaceholderInput
              id={`${id}-password`}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              hasError={!!errors.password}
              {...register('password')}
            />
          </FormField>
        </motion.div>

        <motion.div variants={fieldVariant}>
          <FormField label="Confirm Password" htmlFor={`${id}-confirm`} error={errors.confirm_password?.message} required>
            <AnimatedPlaceholderInput
              id={`${id}-confirm`}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              hasError={!!errors.confirm_password}
              {...register('confirm_password')}
            />
          </FormField>
        </motion.div>

        <motion.div variants={fieldVariant}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={signUp.isPending}
            className="rounded-full bg-gradient-to-r from-jira-blue to-jira-blue-hover text-xs font-bold uppercase tracking-wider shadow-md shadow-jira-blue/30"
          >
            Create Account
          </Button>
        </motion.div>
      </motion.div>
    </form>
  )
}
