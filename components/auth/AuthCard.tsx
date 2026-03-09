import { type ReactNode } from 'react'

interface AuthCardProps {
  title:    string
  children: ReactNode
}

export function AuthCard({ title, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-sm rounded-[var(--radius-2xl)] bg-surface px-8 py-10 shadow-[var(--shadow-auth)]">
      {/* Logo mark */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] bg-jira-blue">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path
              d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M16 8L22 12V20L16 24L10 20V12L16 8Z"
              fill="white"
              fillOpacity="0.3"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-text-primary">{title}</h1>
      </div>

      {children}
    </div>
  )
}
