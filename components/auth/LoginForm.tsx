'use client'

import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { loginSchema, type LoginFormValues } from '@/types/auth'
import { useSignIn } from '@/hooks/useSignIn'
import { fieldVariant, fieldContainerVariant } from '@/components/auth/AuthSplitCard'
import { AnimatedPlaceholderInput } from '@/components/ui/AnimatedPlaceholderInput'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/Alert'
import Link from 'next/link'


export function LoginForm() {
  const id       = useId()
  const signIn   = useSignIn()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  function onSubmit(values: LoginFormValues) {
    signIn.mutate(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <motion.div
        variants={fieldContainerVariant}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4"
      >
        {signIn.isError && (
          <motion.div variants={fieldVariant}>
            <Alert variant="error">{(signIn.error as Error).message}</Alert>
          </motion.div>
        )}

        <motion.div variants={fieldVariant}>
          <FormField label="E-mail" htmlFor={`${id}-email`} error={errors.email?.message}>
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
          <FormField label="Password" htmlFor={`${id}-password`} error={errors.password?.message}>
            <AnimatedPlaceholderInput
              id={`${id}-password`}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              hasError={!!errors.password}
              {...register('password')}
            />
          </FormField>
        </motion.div>

        <motion.div variants={fieldVariant}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={signIn.isPending}
            className="rounded-full bg-gradient-to-r from-jira-blue to-jira-blue-hover text-xs font-bold uppercase tracking-wider shadow-md shadow-jira-blue/30"
          >
            Sign In
          </Button>
        </motion.div>
      </motion.div>
    </form>
  )
}
