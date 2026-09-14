import { createFileRoute } from "@tanstack/react-router"
import { gamesQueryOptions } from "#/queries/games"
import { useSuspenseQuery } from "@tanstack/react-query"
import { z } from "zod"
import GameSelectionItem from "#/components/GameSelectionItem"

const searchSchema = z.object({
	offset: z.number().catch(0).default(0),
})

export const Route = createFileRoute("/")({
	validateSearch: searchSchema,
	loaderDeps: ({ search: { offset } }) => ({ offset }),
	loader: async ({ deps: { offset }, context }) => {
		try {
			const data = await context.queryClient.query(gamesQueryOptions(offset))
			return { data }
		} catch {
			return { data: null }
		}
	},
	component: App,
})

function App() {
	const { offset } = Route.useSearch()
	const { data } = useSuspenseQuery(gamesQueryOptions(offset))

	return (
		<main className="page-wrap px-4 pb-8 pt-14">
			{/* game section */}
			<section className="flex flex-col gap-2">
				{data.map((game_data) => (
					<GameSelectionItem key={game_data.appid} game={game_data} />
				))}
			</section>
		</main>
	)
}
