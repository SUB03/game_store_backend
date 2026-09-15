import { Link } from "@tanstack/react-router"
import ThemeToggle from "./ThemeToggle"
import { Route } from "#/routes/__root"
import storeIcon from "#/images/storeIcon.png"

export default function Header() {
	const user = Route.useRouteContext().user

	return (
		<header className="sticky top-0 z-50 border-b border-(--line) bg-(--header-bg) px-4 backdrop-blur-lg">
			<nav className="page-wrap max-w-6xl mx-auto flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-5">
				<div className="m-0 shrink-0 text-base font-semibold tracking-tight flex gap-10">
					<a href="/">
						<img
							src={storeIcon}
							alt="store icon"
							width={64}
							height={64}
							className="invert-75"
						/>
					</a>
					<div className="flex">
						<Link to="/" className="header-nav-e">
							STORE
						</Link>
						<Link to="/" className="header-nav-e">
							COMMUNITY
						</Link>
						<Link to="/about" className="header-nav-e">
							ABOUT
						</Link>
					</div>
				</div>

				<div className="ml-auto flex items-center gap-1.5 sm:gap-4">
					{user ? (
						<Link to="/profile" className="header-nav-e">
							{user.username}
						</Link>
					) : (
						<Link to="/login" className="header-nav-e">
							sign in
						</Link>
					)}
					<ThemeToggle />
				</div>
			</nav>
		</header>
	)
}
