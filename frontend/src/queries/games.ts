import type { Game } from "#/types"
import { store_api } from "#/utils/api"
import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"

export const fetchGames = createServerFn({ method: "GET" })
	.validator((offset: number) => offset)
	.handler(async ({ data: offset }) => {
		try {
			const response = await store_api.get<Array<Game>>("store/games", {
				params: { offset },
			})
			return response.data
		} catch {
			throw new Error("Failed to fetch games")
		}
	})

export const gamesQueryOptions = (offset: number) =>
	queryOptions({
		queryKey: ["games_section", offset],
		queryFn: () => fetchGames({ data: offset }),
	})
