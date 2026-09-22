import { createFileRoute } from "@tanstack/react-router"
import { Suspense, useEffect, useState } from "react"
import { z } from "zod"
import GameSelectionTail from "#/components/GameSelectionTail"
import GameFilters, { GameFiltersSkeleton } from "#/components/GameFilters"
import GameSelectionHead, {
	GameSelectionSkeleton,
} from "#/components/GameSelectionHead"
import Search from "#/components/Search"

const searchSchema = z.object({
	offset: z.number().int().min(0).optional(),
	tags: z.array(z.string()).optional(),
})

export const Route = createFileRoute("/")({
	shouldReload: false,
	validateSearch: searchSchema,
	component: App,
})

function App() {
	const { offset = 0, tags: selected_tags = [] } = Route.useSearch()
	const [started, setStarted] = useState(false)
	const tagsKey = selected_tags.join(",")
	const handleLoadMore = () => setStarted(true)

	useEffect(() => {
		setStarted(false)
	}, [tagsKey])

	console.log(started)
	return (
		<main className="page-wrap px-4 pb-8">
			<Search />
			<section className="flex gap-4 justify-end flex-nowrap p-4 max-w-6xl mx-auto bg-linear-0 from-[rgba(44,48,55)] to-[rgba(80,95,110)]">
				<Suspense fallback={<GameFiltersSkeleton />}>
					<GameFilters selected_tags={selected_tags} />
				</Suspense>
				<div className="basis-full">
					<div className="flex flex-col gap-2">
						<Suspense fallback={<GameSelectionSkeleton />}>
							<GameSelectionHead
								tags={selected_tags}
								started={started}
								handleLoadMore={handleLoadMore}
							/>
						</Suspense>
						{started && (
							<Suspense fallback={<GameSelectionSkeleton />}>
								<GameSelectionTail
									key={selected_tags.join(",")}
									offset={offset}
									tags={selected_tags}
								/>
							</Suspense>
						)}
					</div>
				</div>
			</section>
		</main>
	)
}
