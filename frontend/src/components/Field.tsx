import type { InputHTMLAttributes } from "react"

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string
	error?: string
}

export function Field({ label, error, id, ...props }: FieldProps) {
	const inputId = id ?? props.name
	return (
		<label htmlFor={inputId} className="flex flex-col gap-1.5">
			<span className="text-sm">{label}</span>
			<input
				id={inputId}
				className="bg-(--search-bg) hover:bg-(--search-bg-hover) rounded-xs px-3 py-2 text-sm outline-none disabled:opacity-60"
				{...props}
			/>
			{error && <span className="text-xs text-red-600">{error}</span>}
		</label>
	)
}
