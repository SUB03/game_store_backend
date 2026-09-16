interface Props extends Intl.DateTimeFormatOptions {
	locale?: string
	date: Date
}

export function formatDateTime({ date, locale, dateStyle }: Props) {
	const dateFormatter = new Intl.DateTimeFormat(locale, {
		dateStyle,
	})

	return dateFormatter.format(date)
}
