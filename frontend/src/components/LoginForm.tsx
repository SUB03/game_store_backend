import { useState } from "react"
import { useRouter, useSearch } from "@tanstack/react-router"
import { useLogin } from "#/mutations/auth"
import { Field } from "./Field"

export function LoginForm() {
	const router = useRouter()
	const { redirect } = useSearch({ from: "/login" })
	const loginMutation = useLogin()

	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")

	async function handleSubmit(e: React.SubmitEvent) {
		e.preventDefault()
		try {
			await loginMutation.mutateAsync({ username, password })
			await router.invalidate()
			router.navigate({ to: redirect || "/" })
		} catch {
			// error surfaced via login.error below
		}
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<Field
				label="Login"
				name="login"
				type="login"
				autoComplete="login"
				required
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				disabled={loginMutation.isPending}
			/>

			<Field
				label="Password"
				name="password"
				type="password"
				autoComplete="current-password"
				required
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				disabled={loginMutation.isPending}
			/>

			{loginMutation.error && (
				<p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
					{loginMutation.error.message}
				</p>
			)}

			<button
				type="submit"
				disabled={loginMutation.isPending}
				className="mt-2 rounded-xs blue-button px-4 py-4 text-md text-gray-100 font-medium disabled:opacity-60"
			>
				{loginMutation.isPending ? "Signing in…" : "Sign in"}
			</button>
		</form>
	)
}
