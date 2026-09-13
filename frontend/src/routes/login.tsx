import { LoginForm } from "#/components/LoginForm"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/login")({
	validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
		redirect: typeof search.redirect === "string" ? search.redirect : undefined,
	}),
	component: LoginPage,
})

function LoginPage() {
	return (
		<div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center px-4 py-12">
			<h1 className="mb-6 text-2xl font-semibold tracking-tight">Sign in</h1>

			<LoginForm />

			<p className="mt-6 text-sm text-neutral-500">
				Don't have an account?{" "}
				<Link to="/register" className="underline hover:text-neutral-900">
					Create one
				</Link>
			</p>
		</div>
	)
}
