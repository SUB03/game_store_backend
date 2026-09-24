import { gameQueryOptions } from "#/queries/game"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/app/$appid/")({
	component: () => null,
	beforeLoad: async ({ params, context }) => {
		const game = await context.queryClient.query(
			gameQueryOptions({ appid: params.appid }),
		)

		if (!game) {
			throw redirect({
				to: "/",
			})
		}

		throw redirect({
			to: "/app/$appid/$title",
			params: { appid: params.appid, title: game.name },
		})
	},
})
