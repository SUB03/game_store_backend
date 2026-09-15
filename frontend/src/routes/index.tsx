import { createFileRoute } from "@tanstack/react-router"
import { gamesQueryOptions } from "#/queries/games"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Suspense, useState } from "react"
import { z } from "zod"
import GameSelectionItemSmall from "#/components/GameSelectionItemSmall"
import GameSelectionTail from "#/components/GameSelectionTail"

const searchSchema = z.object({
	offset: z.number().int().min(0).optional(),
})

export const Route = createFileRoute("/")({
	shouldReload: false,
	validateSearch: searchSchema,
	loader: async ({ context }) => {
		try {
			const data = await context.queryClient.query(gamesQueryOptions())
			return { data }
		} catch {
			return { data: null }
		}
	},
	component: App,
})

function App() {
	const { offset = 0 } = Route.useSearch()
	const [started, setStarted] = useState(false)

	const { data: games } = useSuspenseQuery(gamesQueryOptions())

	const handleLoadMore = () => setStarted(true)

	return (
		<main className="page-wrap px-4 pb-8 pt-14">
			{/* game section */}
			<section className="p-10 max-w-6xl mx-auto bg-linear-0 from-[rgba(44,48,55)] to-[rgba(80,95,110)]">
				<div className="flex flex-col gap-2">
					{games.map((game) => (
						<GameSelectionItemSmall key={game.appid} game={game} />
					))}
					{started && (
						<Suspense>
							<GameSelectionTail offset={offset} />
						</Suspense>
					)}
				</div>
				{!started && (
					<div className="flex justify-center mt-4">
						<button
							type="button"
							onClick={handleLoadMore}
							disabled={games.length < 12}
							className="px-30 py-2 rounded-xs bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-sm"
						>
							Show more
						</button>
					</div>
				)}
			</section>
		</main>
	)
}
