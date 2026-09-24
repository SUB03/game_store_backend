import { PurchaseError, usePurchaseGame } from "#/mutations/purchase"
import { ownedGamesQueryOptions } from "#/queries/ownedGames"
import { Route } from "#/routes/__root"
import type { Game } from "#/types"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import Price from "./Price"

export default function BuyPanel({ game }: { game: Game }) {
	const user = Route.useRouteContext().user

	if (!user) {
		return <SignInToBuy game={game} />
	}
	return <PurchaseControls game={game} />
}

function gamePath(game: Game) {
	return `/app/${game.appid}/${game.name}`
}

function priceProps(game: Game) {
	const undiscounted_price =
		game.discount > 0 ? game.price * (2 - game.discount / 100) : null
	return { price: game.price, discount: game.discount, undiscounted_price }
}

function SignInToBuy({ game }: { game: Game }) {
	return (
		<div className="glass-panel shadow_item flex flex-wrap items-center justify-between gap-4 p-4">
			<Price {...priceProps(game)} />
			<Link
				to="/login"
				search={{ redirect: gamePath(game) }}
				className="rounded-xs px-6 py-3 font-medium text-gray-100 blue-button"
			>
				Sign in to purchase
			</Link>
		</div>
	)
}

function PurchaseControls({ game }: { game: Game }) {
	const { data: ownedGames } = useSuspenseQuery(ownedGamesQueryOptions())
	const purchase = usePurchaseGame()

	const owned = ownedGames.some((g) => g.appid === game.appid)
	const isFree = game.price <= 0

	return (
		<div className="glass-panel shadow_item flex flex-wrap items-center justify-between gap-4 p-4">
			<Price {...priceProps(game)} />
			<div className="flex flex-col items-end gap-2">
				{owned ? (
					<Link
						to="/profile"
						className="rounded-xs border border-(--chip-line) px-6 py-3 font-semibold text-(--sea-ink)"
					>
						In your library
					</Link>
				) : (
					<button
						type="button"
						disabled={purchase.isPending}
						onClick={() => purchase.mutate(game.appid)}
						className="rounded-xs px-6 py-3 font-medium text-gray-100 blue-button disabled:opacity-60"
					>
						{purchase.isPending
							? "Processing…"
							: isFree
								? "Add to library"
								: "Buy now"}
					</button>
				)}
				{purchase.error && !owned && (
					<p className="rounded-md bg-red-50 px-3 py-2 text-end text-sm text-red-700">
						{purchase.error.message}
						{purchase.error instanceof PurchaseError &&
							purchase.error.status === 401 && (
								<>
									{" "}
									<Link
										to="/login"
										search={{ redirect: gamePath(game) }}
										className="underline"
									>
										Sign in
									</Link>
								</>
							)}
					</p>
				)}
			</div>
		</div>
	)
}
