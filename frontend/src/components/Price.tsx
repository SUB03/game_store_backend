import { formatCurrencyValue } from "#/utils/currencyFormatter"

export default function Price({
	undiscounted_price,
	discount,
	price,
}: {
	undiscounted_price: number | null
	discount: number
	price: number
}) {
	return (
		<>
			{undiscounted_price ? (
				<div className="self-end flex">
					<div className="px-2 flex text-[26px] bg-(--price-discount-bg) text-(--price) font-bold self-stretch ">
						<span className="self-center">-{discount}%</span>
					</div>
					<div className="px-2 bg-(--price-bg) flex flex-col">
						<span className="relative text-gray-500 text-end before:absolute before:left-0 before:right-0 before:top-[40%] before:border-b before:border-[#738895] before:shadow-[0_0_2px_#000] before:-skew-y-[15deg]">
							{formatCurrencyValue({
								value: undiscounted_price,
								locale: "us",
							})}
						</span>
						<span className="text-(--price) text-base text-end">
							{formatCurrencyValue({
								value: price,
								locale: "us",
							})}
						</span>
					</div>
				</div>
			) : (
				<div className="self-end">
					<span>
						{price > 0
							? formatCurrencyValue({
									value: price,
									locale: "us",
								})
							: "Free To Play"}
					</span>
				</div>
			)}
		</>
	)
}
