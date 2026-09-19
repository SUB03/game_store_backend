import { store_api } from "#/utils/api"
import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

export type TagCount = {
	tag: string
	game_count: number
}

export type TagGroups = Record<string, TagCount[]>

const tagsParamsSchema = z.object({
	selected_tags: z.array(z.string()).optional(),
})

export const fetchTags = createServerFn({ method: "GET" })
	.validator(tagsParamsSchema)
	.handler(async ({ data }) => {
		const response = await store_api.get<TagGroups>("store/tags", {
			params: data,
		})
		return response.data
	})

export const tagsQueryOptions = (selected_tags?: string[]) =>
	queryOptions({
		queryKey: ["tags", selected_tags],
		queryFn: () =>
			fetchTags({ data: selected_tags?.length ? { selected_tags } : {} }),
	})
