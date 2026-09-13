import { RegisterForm } from '#/components/RegisterForm'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Create account</h1>

      <RegisterForm />

      <p className="mt-6 text-sm text-neutral-500">
        Already have an account?{' '}
        <Link to="/login" className="underline hover:text-neutral-900">
          Sign in
        </Link>
      </p>
    </div>
  )
}