import type { Game } from "#/types"

export default function GameSelectionItem({ game }: { game: Game }) {
	return (
		<div>
			<div className="flex flex-row">
				<a href="/" className="">
					<img
						src={game.header_image}
						alt="Game header"
						className="w-full h-full"
					/>
				</a>
				<div className="flex flex-col">
					<div className="bg-linear-to-t from-gray-900 to-gray-700 h-full w-full">
						<div className="px-3 py-4 flex flex-col gap-2">
							<p className="text-sm w-[400px]">{game.short_description}</p>
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
				</div>
			</div>
			<div className="bg-gray-950">
				<div className="px-3 py-4">
					<div className="text-sm">reviews {game.positive + game.negative}</div>
					<div className="text-sm">{game.price}</div>
				</div>
			</div>
		</div>
	)
}
