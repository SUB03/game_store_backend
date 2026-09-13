import { createMiddleware } from "@tanstack/react-start"
import { getCookie, setResponseHeader } from "@tanstack/react-start/server"
import axios from "redaxios"

export const AUTH_API = "http://localhost:8000"

export const api = axios.create({
	baseURL: AUTH_API,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
})

export const authMiddleware = createMiddleware({ type: "function" }).server(
	async ({ next }) => {
		let access_token = getCookie("access_token")
		let refresh_token = getCookie("refresh_token")

		const proxyCookies = (backendResponse: Response) => {
			const setCookieHeaders = backendResponse.headers.getSetCookie()
			setResponseHeader("Set-Cookie", setCookieHeaders)
		}

		const fetchFromBackend = async (
			urlPath: string,
			options: RequestInit = {},
		): Promise<Response> => {
			const headers = new Headers(options.headers)
			if (access_token) {
				headers.set("access_token", access_token)
			}

			let response = await fetch(urlPath, { ...options, headers })

			if (response.status === 401 && refresh_token) {
				try {
					const refreshResponse = await fetch(AUTH_API + "/users/refresh", {
						method: "POST",
						headers: {
							Cookie: `refresh_token=${refresh_token}`,
							"Content-Type": "application/json",
						},
					})

					if (refreshResponse.ok) {
						proxyCookies(refreshResponse)

						const newCookies = refreshResponse.headers.getSetCookie().join("; ")
						if (newCookies) {
							headers.set("cookie", newCookies)
						}

						response = await fetch(urlPath, { ...options, headers })
					}
				} catch (err) {
					console.error(err)
				}
			}
			return response
		}
		return next({
			context: {
				api: fetchFromBackend,
			},
		})
	},
)
