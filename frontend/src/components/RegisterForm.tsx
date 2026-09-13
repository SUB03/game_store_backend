// src/features/auth/RegisterForm.tsx
import { useState } from "react"
import { useRouter } from "@tanstack/react-router"
import { Field } from "./Field"
import { useRegister } from "#/mutations/auth"

export function RegisterForm() {
	const router = useRouter()
	const register = useRegister()

	const [username, setUsername] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirm, setConfirm] = useState("")
	const [localError, setLocalError] = useState<string | null>(null)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLocalError(null)

		if (password.length < 8) {
			setLocalError("Password must be at least 8 characters.")
			return
		}
		if (password !== confirm) {
			setLocalError("Passwords do not match.")
			return
		}

		try {
			await register.mutateAsync({ username, email, password })
			await router.invalidate()
			router.navigate({ to: "/" })
		} catch {
			// server error surfaced via register.error
		}
	}

	const error = localError ?? register.error?.message ?? null

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<Field
				label="Name"
				name="name"
				type="text"
				autoComplete="name"
				required
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				disabled={register.isPending}
			/>

			<Field
				label="Email"
				name="email"
				type="email"
				autoComplete="email"
				required
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				disabled={register.isPending}
			/>

			<Field
				label="Password"
				name="password"
				type="password"
				autoComplete="new-password"
				required
				minLength={8}
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				disabled={register.isPending}
			/>

			<Field
				label="Confirm password"
				name="confirm"
				type="password"
				autoComplete="new-password"
				required
				value={confirm}
				onChange={(e) => setConfirm(e.target.value)}
				disabled={register.isPending}
			/>

			{error && (
				<p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
					{error}
				</p>
			)}

			<button
				type="submit"
				disabled={register.isPending}
				className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
			>
				{register.isPending ? "Creating account…" : "Create account"}
			</button>
		</form>
	)
}
