import { useMutation, useQueryClient } from "@tanstack/react-query"
import { store_api } from "#/utils/api"

type PurchaseRedirect = {
	payment_id: string
	confirmation_url: string
}

type PurchaseGranted = {
	message: string
	appid: number
}

export type PurchaseResponse = PurchaseRedirect | PurchaseGranted

export class PurchaseError extends Error {
	status: number

	constructor(status: number, message: string) {
		super(message)
		this.name = "PurchaseError"
		this.status = status
	}
}

// redaxios rejects with a Response-like object carrying `status` and the
// parsed JSON body in `data`.
function statusOf(err: unknown): number | undefined {
	if (err && typeof err === "object" && "status" in err) {
		const status = (err as { status: unknown }).status
		if (typeof status === "number") {
			return status
		}
	}
	return undefined
}

function detailOf(err: unknown, fallback: string): string {
	if (err && typeof err === "object" && "data" in err) {
		const data = (err as { data: unknown }).data
		if (data && typeof data === "object" && "detail" in data) {
			const detail = (data as { detail: unknown }).detail
			if (typeof detail === "string") {
				return detail
			}
		}
	}
	return fallback
}

function readCsrfCookie(): string {
	const match = document.cookie.match(/(?:^|;\s*)CSRF=([^;]*)/)
	return match?.[1] ? decodeURIComponent(match[1]) : ""
}

export function usePurchaseGame() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (appid: number): Promise<PurchaseResponse> => {
			try {
				const { data } = await store_api.post<PurchaseResponse>(
					"/store/purchase_game",
					{ appid },
					{ headers: { CSRF: readCsrfCookie() } },
				)
				return data
			} catch (err) {
				throw new PurchaseError(
					statusOf(err) ?? 0,
					detailOf(err, "Purchase failed, please try again"),
				)
			}
		},
		onSuccess: (data) => {
			if ("confirmation_url" in data) {
				window.location.assign(data.confirmation_url)
			} else {
				queryClient.invalidateQueries({ queryKey: ["owned-games"] })
			}
		},
		onError: (error) => {
			// The backend already knows we own it - sync the local library.
			if (error instanceof PurchaseError && error.status === 409) {
				queryClient.invalidateQueries({ queryKey: ["owned-games"] })
			}
		},
	})
}
