import { useEffect, useRef, useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { gamesQueryOptions } from "#/queries/games"

/** Small hook: returns `value` after it stops changing for `delay` ms. */
function useDebouncedValue<T>(value: T, delay = 300) {
	const [debounced, setDebounced] = useState(value)
	useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delay)
		return () => clearTimeout(id)
	}, [value, delay])
	return debounced
}

export default function Search() {
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState("")
	const containerRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	// Debounce so we don't hammer the API on every keystroke
	const debouncedQuery = useDebouncedValue(query, 300)
	const trimmed = debouncedQuery.trim()

	const { data, isFetching, isError } = useQuery({
		// adjust the params shape to match your GamesParams schema
		...gamesQueryOptions({ offset: 0, search: trimmed }),
		enabled: trimmed.length > 0,
		// keep showing previous results while the next query loads (no flicker)
		placeholderData: keepPreviousData,
		staleTime: 60_000,
	})

	const games = data?.results ?? []

	// Close when clicking outside
	useEffect(() => {
		if (!open) return
		const onPointerDown = (e: PointerEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener("pointerdown", onPointerDown)
		return () => document.removeEventListener("pointerdown", onPointerDown)
	}, [open])

	return (
		<div className="sticky top-0 z-50 bg-(--search-bg) w-full px-4 border-b border-(--line)">
			<nav className="max-w-6xl mx-auto flex justify-end py-1">
				<div ref={containerRef} className="relative w-96">
					<form
						onSubmit={(e) => {
							e.preventDefault()
							// navigate(`/search?q=${encodeURIComponent(query)}`)
							setOpen(false)
						}}
					>
						<input
							ref={inputRef}
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onFocus={() => setOpen(true)}
							placeholder="Search the store"
							autoComplete="off"
							className="w-full rounded bg-[#316282]/50 px-3 py-1.5 text-sm text-white placeholder-white/60 outline-none focus:bg-[#316282] focus:ring-1 focus:ring-(--line)"
						/>
					</form>

					{open && (
						<div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md bg-[#1b2838] p-2 shadow-2xl ring-1 ring-black/40">
							<div className="max-h-96 overflow-y-auto">
								{trimmed.length === 0 ? (
									<p className="px-3 py-2 text-sm text-white/50">
										Start typing to search…
									</p>
								) : isError ? (
									<p className="px-3 py-2 text-sm text-red-400">
										Something went wrong.
									</p>
								) : games.length === 0 && !isFetching ? (
									<p className="px-3 py-2 text-sm text-white/50">
										No results for "{trimmed}"
									</p>
								) : (
									<ul
										className={
											isFetching ? "opacity-60 transition-opacity" : ""
										}
									>
										{games.map((game) => (
											<li key={game.appid}>
												<Link
													to="/app/$appid/$title"
													params={{
														appid: String(game.appid),
														title: game.name,
													}}
													onClick={() => setOpen(false)}
													className="flex items-center gap-3 rounded px-2 py-2 hover:bg-white/10"
												>
													<img
														src={game.header_image}
														alt=""
														className="h-10 w-20 shrink-0 rounded object-cover"
														loading="lazy"
													/>
													<div className="min-w-0">
														<p className="truncate text-sm text-white">
															{game.name}
														</p>
														{game.price != null && (
															<p className="text-xs text-white/50">
																${(game.price / 100).toFixed(2)}
															</p>
														)}
													</div>
												</Link>
											</li>
										))}
									</ul>
								)}
							</div>
						</div>
					)}
				</div>
			</nav>
		</div>
	)
}
