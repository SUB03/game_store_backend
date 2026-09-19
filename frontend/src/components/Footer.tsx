export default function Footer() {
	return (
		<footer className="border-t border-(--line) px-4 pb-14 pt-10 text-(--sea-ink-soft) footer-items gap-20">
			<div className="[grid-area:main] grid-area flex">
				<p className="text-balance">
					© 2026 Empty Corporation. All rights reserved. All trademarks are
					property of their respective owners in the US and other countries.
					Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
					commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus
					et magnis dis parturient montes, nascetur ridiculus mus.
				</p>
			</div>
			<div className="[grid-area:store] flex flex-col">
				<h3>STORE</h3>
				<a href="/about">About Store</a>
				<p>Store SSA</p>
				<p>Storeworks</p>
				<p>Store Distributio</p>
				<p>Gift Cards</p>
			</div>
			<div className="[grid-area:empty] flex flex-col">
				<h3>EMPTY</h3>
				<p>About Empty</p>
				<p>Skills</p>
				<p>Harware</p>
				<p>Recycling</p>
			</div>
			<div className="flex flex-col">
				<h3>LEGAL</h3>
				<p>Privacy</p>
				<p>Accessibility</p>
				<p>Notices & Polices</p>
				<p>Cookies</p>
				<p>Refunds</p>
			</div>
			<div className="flex flex-col">
				<h3>MORE</h3>
				<p>Get Store</p>
				<p>Get Mobile apps</p>
				<p>Get Support</p>
				<a href="/profile">My Account</a>
			</div>
		</footer>
	)
}
