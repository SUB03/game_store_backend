import type { Game } from "#/types"
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
				sm:flex-row
				flex-col
				glass-panel
				shadow-lg shadow-gray-800/60
				text-(--sea-ink-soft)
  			"
		>
			<a href="/" className="m-1 overflow-hidden grow shrink basis-auto sm:basis-1/2 md:basis-1/4]">
				<img
					src={game.header_image}
					alt={game.name}
					className="w-full h-auto object-cover"
				/>
			</a>
			<div className="grid grow shrink basis-auto sm:basis-1/2 md:basis-3/4 pl-2 pr-1 py-1 md:grid-rows-[auto_min-content_min-content_auto] grid-rows-[min-content_min-content_min-content_min_content_auto]  md:[grid-template-areas:'title_title'_'tags_tags'_'platform_price'_'reviews_price'] [grid-template-areas:'title_title'_'tags_tags'_'platform_platform'_'reviews_reviews'_'price_price'] overflow-hidden">
				<a href="/" className="[grid-area:title] hidden md:flex">
					<p className="text-lg self-end font-bold hover:underline">
						{game.name}
					</p>
				</a>
				<div className="[grid-area:tags] h-5 flex flex-wrap text-sm my-2 gap-1 overflow-hidden">
					{visibleTags.map((tag) => (
						<span
							key={tag}
							className="rounded-xs bg-(--inset-glint) text-xs text-center px-2 py-0.5 cursor-pointer overflow-hidden whitespace-nowrap"
						>
							{tag}
						</span>
					))}
				</div>
				<div className="[grid-area:platform] sm:flex text-xs flex-row text-sm gap-2 hidden">
					<span className="hidden md:block">RELESE DATE:</span>
					<span className="">
						{formatDateTime({
							date: new Date(`${game.release_date}Z`),
							dateStyle: "medium",
							locale: "us",
						}).toUpperCase()}
					</span>
				</div>
				<div className="[grid-area:reviews] sm:flex flex-wrap hidden">
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
