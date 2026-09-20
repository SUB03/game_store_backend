import type { Game } from "#/types"
import { store_api } from "#/utils/api"
import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import z from "zod"

const gameParamsSchema = z.object({
	appid: z.string(),
})

export const fetchGame = createServerFn({ method: "GET" })
	.validator(gameParamsSchema)
	.handler(async ({ data }) => {
		try {
			const response = await store_api.get<Game>(
				`store/games/${data.appid}`,
				{},
			)
			return response.data
		} catch {
			throw new Error("Failed to fetch game")
		}
	})

export const gameQueryOptions = ({ appid }: { appid: string }) =>
	queryOptions({
		queryKey: ["game", appid],
		queryFn: () => fetchGame({ data: { appid } }),
	})
