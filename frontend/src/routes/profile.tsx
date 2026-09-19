import { createFileRoute, redirect } from "@tanstack/react-router"

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

	return (
		<div className="min-h-175">
			<div>Hello {context.user.username}!</div>
		</div>
	)
}
