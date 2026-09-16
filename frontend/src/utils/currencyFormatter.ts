interface Props extends Intl.NumberFormatOptions {
	locale?: string
	value: number
}

export function formatCurrencyValue({
	currency = "USD",
	currencySign,
	useGrouping,
	minimumIntegerDigits,
	minimumFractionDigits,
	maximumFractionDigits,
	minimumSignificantDigits,
	maximumSignificantDigits,
	locale = "default",
	value,
}: Props) {
	const numberFormatter = new Intl.NumberFormat(locale, {
		currency,
		style: "currency",
		currencySign,
		useGrouping,
		minimumIntegerDigits,
		minimumFractionDigits,
		maximumFractionDigits,
		minimumSignificantDigits,
		maximumSignificantDigits,
	})

	return numberFormatter.format(value)
}
