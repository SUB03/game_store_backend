import type { Game } from "#/types"
import { store_api } from "#/utils/api"
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"

type GamesRespose = {
	results: Game[]
	is_next_page: boolean
}

export const fetchGames = createServerFn({ method: "GET" })
	.validator((offset: number) => {
		return offset
	})
	.handler(async ({ data: offset }) => {
		try {
			const response = await store_api.get<GamesRespose>("store/games", {
				params: { offset },
			})
			return response.data
		} catch {
			throw new Error("Failed to fetch games")
		}
	})

export const gamesQueryOptions = (offset: number = 0) =>
	queryOptions({
		queryKey: ["games", "head"],
		queryFn: () => fetchGames({ data: offset }),
	})

export const gamesInfiniteQueryOptions = (offset: number) =>
	infiniteQueryOptions({
		queryKey: ["games", "tail", offset],
		queryFn: ({ pageParam }) => fetchGames({ data: pageParam }),
		initialPageParam: offset,
		getNextPageParam: (lastPage, _, lastPageParam) =>
			lastPage.is_next_page ? lastPageParam + 12 : undefined,
	})
