import { gamesQueryOptions } from "#/queries/games"
import { useSuspenseQuery } from "@tanstack/react-query"
import GameSelectionItemSmall from "./GameSelectionItemSmall"

interface GameSelectionHeadProps {
	tags: string[]
}

export default function GameSelectionHead({ tags }: GameSelectionHeadProps) {
	const { data: games } = useSuspenseQuery(
		gamesQueryOptions({ offset: 0, tags: tags }),
	)

	return (
		<>
			{games.results.map((game) => (
				<GameSelectionItemSmall key={game.appid} game={game} />
			))}
		</>
	)
}
