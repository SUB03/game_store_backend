import { createFileRoute } from "@tanstack/react-router"
import { gamesQueryOptions } from "#/queries/games"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Suspense, useState } from "react"
import { z } from "zod"
import GameSelectionItemSmall from "#/components/GameSelectionItemSmall"
import GameSelectionTail from "#/components/GameSelectionTail"
import { tagsQueryOptions } from "#/queries/tags"

const searchSchema = z.object({
	offset: z.number().int().min(0).optional(),
})

export const Route = createFileRoute("/")({
	shouldReload: false,
	validateSearch: searchSchema,
	loader: async ({ context }) => {
		try {
			const data = await context.queryClient.query(
				gamesQueryOptions({ offset: 0 }),
			)
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
	const [selectedTags, setSelectedTags] = useState<string[]>([])

	const { data: games } = useSuspenseQuery(gamesQueryOptions({ offset: 0 }))
	const { data: tagGroups } = useSuspenseQuery(tagsQueryOptions(selectedTags))

	const handleLoadMore = () => setStarted(true)

	return (
		<main className="page-wrap px-4 pb-8 pt-14">
			{/* game section */}
			<section className="flex gap-4 justify-end flex-nowrap p-4 max-w-6xl mx-auto bg-linear-0 from-[rgba(44,48,55)] to-[rgba(80,95,110)]">
				<div className="hidden lg:block shadow_item text-lg font-bold text-(--sea-ink-soft) px-2 w-1/3">
					<h1 className="break-normal p-5">Filters</h1>

					{Object.entries(tagGroups).map(([group, tags]) => (
						<details key={group}>
							<summary className="break-normal w-full">{group}</summary>
							{tags.map(({ tag, game_count }) => (
								<div
									key={tag}
									className="flex justify-between pt-2 text-nowrap
									text-xs"
								>
									<span>{tag}</span>
									<span>{game_count}</span>
									{/* button */}
								</div>
							))}
						</details>
					))}
				</div>
				<div className="basis-full">
					<div className="flex flex-col gap-2">
						{games.results.map((game) => (
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
								disabled={!games.is_next_page}
								className="px-30 py-2 rounded-xs bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-sm"
							>
								Show more
							</button>
						</div>
					)}
				</div>
			</section>
		</main>
	)
}
