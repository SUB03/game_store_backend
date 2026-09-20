import { gameQueryOptions } from "#/queries/game"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/app/$appid/$title")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		return await context.queryClient.query(
			gameQueryOptions({ appid: params.appid }),
		)
	},
})

function RouteComponent() {
	const params = Route.useParams()
	const { data: game } = useSuspenseQuery(
		gameQueryOptions({ appid: params.appid }),
	)
	return (
		<div>
			<img src={game.header_image} alt={game.name} />
			<div>{game.detailed_description}</div>
		</div>
	)
}
