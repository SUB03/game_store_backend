import { tagsQueryOptions } from "#/queries/tags"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"

interface GameFiltersProps {
	selected_tags: string[]
}

export default function GameFilters({ selected_tags }: GameFiltersProps) {
	const { data: tag_groups } = useSuspenseQuery(tagsQueryOptions(selected_tags))
	return (
		<div className="hidden lg:block shadow_item text-lg font-bold text-(--sea-ink-soft) px-2 w-1/3">
			<h1 className="break-normal p-5">Filters</h1>

			{Object.entries(tag_groups).map(([group, tags]) => (
				<details key={group}>
					<summary className="break-normal w-full">{group}</summary>
					{tags.map(({ tag, game_count }) => {
						const active = selected_tags.includes(tag)
						const disabled = !active && game_count === 0
						const next = active
							? selected_tags.filter((t) => t !== tag)
							: [...selected_tags, tag]
						return (
							<Link
								key={tag}
								to="/"
								disabled={disabled}
								search={(prev) => ({
									...prev,
									tags: next.length ? next : undefined,
									offset: undefined,
								})}
								resetScroll={false}
								className={
									"flex justify-between gap-2 text-xs px-2 py-1 rounded-xs min-w-0 transition-colors hover:bg-white/5" +
									(active
										? " border-l-4 border-orange-400"
										: " border-l-4 border-transparent font-light")
								}
							>
								<span>{tag}</span>
								<span
									className={`font-light ${active ? "text-orange-400" : ""}`}
								>
									{game_count}
								</span>
							</Link>
						)
					})}
				</details>
			))}
		</div>
	)
}
