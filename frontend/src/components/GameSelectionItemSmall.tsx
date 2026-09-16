import type { Game } from "#/types"
import { formatCurrencyValue } from "#/utils/currencyFormatter"
import { formatDateTime } from "#/utils/dateFormatter"
import Price from "./Price"

export default function GameSelectionItem({ game }: { game: Game }) {
	const totalReviews = game.positive + game.negative
	const positiveRatio = totalReviews > 0 ? game.positive / totalReviews : 0

	const undiscounted_price =
		game.discount > 0 ? game.price * (2 - game.discount / 100) : null

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
				text-(--sea-ink-soft)
  			"
		>
			<a href="/" className="shrink-0 m-1 overflow-hidden">
				<img
					src={game.header_image}
					alt={game.name}
					className="h-auto w-full object-fill"
				/>
			</a>
			<div
				className="grid w-full px-3 py-4 gap-2
						grid-rows-[auto_min-content_min-content_auto]
						[grid-template-areas:'title_title'_'tags_tags'_'platform_price'_'reviews_price']
					"
			>
				<a href="/" className="[grid-area:title] flex">
					<p className="text-lg self-end font-bold hover:underline">
						{game.name}
					</p>
				</a>
				<div className="[grid-area:tags] flex flex-row text-sm gap-1">
					{visibleTags.map((tag) => (
						<span
							key={tag}
							className="rounded-xs bg-(--inset-glint) text-xs text-center px-2 py-0.5 cursor-pointer"
						>
							{tag}
						</span>
					))}
				</div>
				<div className="[grid-area:platform]">
					<div className="flex flex-row text-sm gap-2">
						<span>RELESE DATE:</span>
						<span>
							{formatDateTime({
								date: new Date(`${game.release_date}Z`),
								dateStyle: "medium",
								locale: "us",
							}).toUpperCase()}
						</span>
					</div>
				</div>
				<div className="[grid-area:reviews]">
					<span className={`${reviewColor} text-sm`}>{reviewLabel}</span>
					<span className="text-sm">
						{" "}
						({totalReviews.toLocaleString("en-US")} Reviews)
					</span>
				</div>
				<div className="[grid-area:price] text-sm flex justify-end">
					<Price
						price={game.price}
						discount={game.discount}
						undiscounted_price={undiscounted_price}
					/>
				</div>
			</div>
		</div>
	)
}
