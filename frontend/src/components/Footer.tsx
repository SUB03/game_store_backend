export default function Footer() {
	return (
		<footer className="mt-20 border-t border-(--line) px-4 pb-14 pt-10 text-(--sea-ink-soft) flex gap-50">
			<p className="text-balance">
				© 2026 Valve Corporation. All rights reserved. All trademarks are
				property of their respective owners in the US and other countries. VAT
				included in all prices where applicable.
			</p>
			<div>
				<h3>STORE</h3>
				<a href="/about">About Store</a>
				<p>Store SSA</p>
				<p>Storeworks</p>
				<p>Store Distributio</p>
				<p>Gift Cards</p>
			</div>
			<div>
				<h3>EMPTY</h3>
				<p>About Empty</p>
				<p>Skills</p>
				<p>Harware</p>
				<p>Recycling</p>
			</div>
			<div>
				<h3>LEGAL</h3>
				<p>Privacy</p>
				<p>Accessibility</p>
				<p>Notices & Polices</p>
				<p>Cookies</p>
				<p>Refunds</p>
			</div>
			<div>
				<h3>MORE</h3>
				<p>Get Store</p>
				<p>Get Mobile apps</p>
				<p>Get Support</p>
				<a href="/profile">My Account</a>
			</div>
		</footer>
	)
}
