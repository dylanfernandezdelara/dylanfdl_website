'use client'

import { signIn, signOut } from 'next-auth/react'

const NEUTRAL_BUTTON_STYLES: React.CSSProperties = {
  border: '1px solid var(--bg2)',
  background: 'var(--bg1)',
  color: 'var(--fg1)',
  borderRadius: '999px',
  padding: '0.65rem 1.25rem',
  fontWeight: 600,
  cursor: 'pointer',
}

const GoogleIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 18 18"
    className="google-signin-button__icon"
  >
    <g fill="none" fillRule="evenodd">
      <path
        d="M17.64 9.2045c0-.638-.0573-1.251-.1636-1.8409H9v3.4814h4.8445c-.2086 1.125-.842 2.078-1.792 2.716v2.258h2.908c1.703-1.567 2.68-3.874 2.68-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.258c-.806.54-1.836.86-3.048.86-2.345 0-4.328-1.582-5.035-3.71H.957v2.332C2.438 16.983 5.481 18 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.965 10.712c-.18-.54-.283-1.116-.283-1.712s.103-1.172.283-1.712V4.956H.957C.347 6.173 0 7.549 0 9c0 1.451.347 2.827.957 4.044l3.008-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.51.454 3.44 1.346l2.58-2.58C13.463.89 11.426 0 9 0 5.48 0 2.438 1.017.957 2.956l3.008 2.332C4.672 4.9 6.655 3.58 9 3.58z"
        fill="#EA4335"
      />
    </g>
  </svg>
)

type SignInButtonProps = {
  callbackUrl?: string
  label?: string
}

export function SignInButton({
  callbackUrl = '/private/interactive',
  label = 'Sign in with Google',
}: SignInButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signIn('google', { callbackUrl })}
      className="google-signin-button"
      aria-label={label}
    >
      <GoogleIcon />
      <span className="google-signin-button__text">{label}</span>
    </button>
  )
}

type SignOutButtonProps = {
  label?: string
}

export function SignOutButton({ label = 'Sign out' }: SignOutButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      style={NEUTRAL_BUTTON_STYLES}
    >
      {label}
    </button>
  )
}
