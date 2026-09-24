import { useMutation } from "@tanstack/react-query"
import { auth_api } from "#/utils/api"

type Credentials = { username: string; password: string }
type RegisterInput = Credentials & { email: string }

interface AuthResponse {
	message: string
	CSRF: string
}

export function useLogin() {
	return useMutation({
		mutationFn: async ({ username, password }: Credentials) => {
			const body = new URLSearchParams()
			body.set("username", username)
			body.set("password", password)
			const { data } = await auth_api.post<AuthResponse>("/users/login", body, {
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			})
			return data
		},
	})
}

export function useRegister() {
	return useMutation({
		mutationFn: async (input: RegisterInput) => {
			const { data } = await auth_api.post<AuthResponse>(
				"/users/registrate",
				input,
			)
			return data
		},
	})
}

export function useLogout() {
	return useMutation({
		mutationFn: async () => {
			await auth_api.post("/users/logout")
		},
	})
}
