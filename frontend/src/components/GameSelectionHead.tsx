import { gamesQueryOptions } from "#/queries/games"
import { useSuspenseQuery } from "@tanstack/react-query"
import GameSelectionItemSmall from "./GameSelectionItemSmall"

interface GameSelectionHeadProps {
	tags: string[]
	started: boolean
	handleLoadMore: () => void
}

export default function GameSelectionHead({
	tags,
	started,
	handleLoadMore,
}: GameSelectionHeadProps) {
	const { data: games } = useSuspenseQuery(
		gamesQueryOptions({ offset: 0, tags: tags }),
	)

	return (
		<>
			{games.results.map((game) => (
				<GameSelectionItemSmall key={game.appid} game={game} />
			))}
			{!started && games.is_next_page && (
				<div className="flex justify-center mt-4">
					<button
						type="button"
						onClick={handleLoadMore}
						className="px-30 py-2 rounded-xs bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-sm"
					>
						Show more
					</button>
				</div>
			)}
		</>
	)
}
