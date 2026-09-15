import { gamesInfiniteQueryOptions } from "#/queries/games"
import { Route } from "#/routes/index"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import GameSelectionItemSmall from "./GameSelectionItemSmall"

export default function GameSelectionTail({ offset }: { offset: number }) {
	const navigate = useNavigate({ from: Route.fullPath })

	const [startOffset] = useState(offset < 0 ? 0 : offset)

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery(gamesInfiniteQueryOptions(startOffset + 12))

	useEffect(() => {
		navigate({
			search: (prev) => ({
				...prev,
				offset: startOffset + 12,
			}),
			replace: true,
			resetScroll: false,
		})
	}, [startOffset, navigate])

	return (
		<>
			{data.pages.flat().map((game) => (
				<GameSelectionItemSmall key={game.appid} game={game} />
			))}

			{hasNextPage && (
				<div className="flex justify-center mt-4">
					<button
						type="button"
						onClick={() => fetchNextPage()}
						disabled={isFetchingNextPage}
						className="px-30 py-2 rounded-xs bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-sm"
					>
						{isFetchingNextPage ? "Loading…" : "Load more"}
					</button>
				</div>
			)}
		</>
	)
}
