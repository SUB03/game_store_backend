import { gamesInfiniteQueryOptions } from "#/queries/games"
import { Route } from "#/routes/index"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import GameSelectionItemSmall from "./GameSelectionItemSmall"

export default function GameSelectionTail({ offset }: { offset: number }) {
	const navigate = useNavigate({ from: Route.fullPath })

	const [startOffset] = useState(offset === 0 ? 12 : offset)

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery(gamesInfiniteQueryOptions(startOffset))

	useEffect(() => {
		const currentBatchStart = startOffset + (data.pages.length - 1) * 12
		navigate({
			search: (prev) => ({
				...prev,
				offset: currentBatchStart >= 0 ? currentBatchStart : undefined,
			}),
			replace: true,
			resetScroll: false,
		})
	}, [data.pages.length, startOffset, navigate])

	return (
		<>
			{data.pages
				.flatMap((page) => page.results)
				.map((game) => (
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
