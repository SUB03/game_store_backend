import { useLogout } from "#/mutations/auth"
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router"

export const Route = createFileRoute("/profile")({
	beforeLoad: async ({ context }) => {
		if (!context.user) {
			throw redirect({
				to: "/login",
			})
		}
		return { user: context.user }
	},
	component: RouteComponent,
})

function RouteComponent() {
	const context = Route.useRouteContext()
	const router = useRouter()
	const logout = useLogout()

	return (
		<div className="min-h-175">
			<div>Hello {context.user.username}!</div>
			<button
				className="rounded-xs p-2 mt-3 blue-button cursor-pointer"
				type="button"
				onClick={async () => {
					await logout.mutateAsync()
					router.invalidate()
				}}
			>
				Logout
			</button>
		</div>
	)
}
