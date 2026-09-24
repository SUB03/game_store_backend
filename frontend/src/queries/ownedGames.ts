import type { Game } from "#/types"
import { authMiddleware, STORE_API } from "#/utils/api"
import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"

type OwnedGamesResponse = {
	results: Game[]
}

export const fetchOwnedGames = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }): Promise<Game[]> => {
		try {
			const response = await context.api(`${STORE_API}/store/owned_games`)
			if (!response.ok) {
				throw new Error("Failed to fetch your games")
			}
			const data: OwnedGamesResponse = await response.json()
			return data.results
		} catch {
			throw new Error("Failed to fetch your games")
		}
	})

export const ownedGamesQueryOptions = () =>
	queryOptions({
		queryKey: ["owned-games"],
		queryFn: () => fetchOwnedGames(),
	})
