import type { Game } from "#/types"

export default function GameSelectionItem({ game }: { game: Game }) {
	const totalReviews = game.positive + game.negative
	const positiveRatio = totalReviews > 0 ? game.positive / totalReviews : 0

	const visibleTags = game.tags.slice(0, 5)

	let reviewLabel: string = "No"
	let reviewColor: string = ""

	if (positiveRatio >= 0.8) {
		reviewLabel = "Very Positive"
		reviewColor = "text-blue-400"
	} else if (positiveRatio >= 0.6) {
		reviewLabel = "Positive"
		reviewColor = "text-blue-400"
	} else if (positiveRatio >= 0.4) {
		reviewLabel = "Mixed"
		reviewColor = "text-yellow-400"
	} else if (positiveRatio >= 0.2) {
		reviewLabel = "Negative"
		reviewColor = "text-orange-400"
	} else if (positiveRatio > 0) {
		reviewLabel = "Very Negative"
		reviewColor = "text-orange-400"
	}

	return (
		<div
			className="
				flex
				glass-panel
				shadow-lg shadow-gray-800/60
  			"
		>
			<a href="/" className="shrink-0 m-1 overflow-hidden">
				<img
					src={game.header_image}
					alt="Game header"
					className="h-auto w-full object-fill"
				/>
			</a>
			<div
				className="grid w-full px-3 py-4 gap-2
						grid-rows-[auto_min-content_min-content_auto]
						[grid-template-areas:'title_title'_'tags_tags'_'platform_price'_'reviews_price']
					"
			>
				<p className="[grid-area:title] text-lg">{game.name}</p>
				<div className="[grid-area:tags] flex flex-row text-sm gap-1">
					{visibleTags.map((tag) => (
						<span
							key={tag}
							className="border rounded-xs bg-gray-600 text-xs text-center px-2"
						>
							{tag}
						</span>
					))}
				</div>
				<div className="[grid-area:platform]">
					<div className="flex flex-row text-sm gap-2">
						<span>RELESE DATE:</span>
						<span>{game.release_date}</span>
					</div>
				</div>
				<div className="[grid-area:reviews]">
					<span className={`${reviewColor} text-sm`}>{reviewLabel}</span>
					<span className="text-sm"> ({totalReviews} Reviews)</span>
				</div>
				<div className="[grid-area:price] text-sm text-end">
					{game.price > 0 ? game.price : "Free To Play"}
				</div>
			</div>
		</div>
	)
}
