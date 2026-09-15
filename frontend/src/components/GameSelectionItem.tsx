import type { Game } from "#/types"

export default function GameSelectionItem({ game }: { game: Game }) {
	const totalReviews = game.positive + game.negative
	const positiveRatio = totalReviews > 0 ? game.positive / totalReviews : 0

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
		<div>
			<div className="flex flex-row bg-linear-to-t from-gray-900 to-gray-700">
				<a href="/" className="shrink-0 m-1">
					<img
						src={game.header_image}
						alt="Game header"
						className="h-full w-auto object-fill"
					/>
				</a>
				<div className="flex flex-col w-full px-3 py-4 gap-2">
					<p className="text-sm">{game.short_description}</p>
					<div className="flex flex-row text-sm gap-2">
						<span>TAGS</span>
						<div className="grid grid-cols-4 gap-1">
							<span className="border rounded-xs bg-gray-700 text-xs text-center px-2">
								TAG1
							</span>
							<span className="border rounded-xs bg-gray-700 text-xs text-center px-2">
								TAG1
							</span>
							<span className="border rounded-xs bg-gray-700 text-xs text-center px-2">
								TAG1
							</span>
							<span className="border rounded-xs bg-gray-700 text-xs text-center px-2">
								TAG1
							</span>
							<span className="border rounded-xs bg-gray-700 text-xs text-center px-2">
								TAG1
							</span>
							<span className="border rounded-xs bg-gray-700 text-xs text-center px-2">
								TAG1
							</span>
						</div>
					</div>
					<div>
						<div className="flex flex-row text-sm gap-2">
							<span>RELESE DATE:</span>
							<span>{game.release_date}</span>
						</div>
						<div className="flex flex-row text-sm gap-2">
							<div>DEVELOPED BY:</div>
							<span>dev names</span>
						</div>
						<div className="flex flex-row text-sm gap-2">
							<div>PUBLISHED BY:</div>
							<span>publisher names</span>
						</div>
					</div>
				</div>
			</div>
			<div className="bg-gray-950">
				<div className="px-3 py-4">
					<span className={`${reviewColor} text-sm`}>{reviewLabel}</span>
					<span className="text-sm"> ({totalReviews} Reviews)</span>
					<div className="text-sm">{game.price}</div>
				</div>
			</div>
		</div>
	)
}
