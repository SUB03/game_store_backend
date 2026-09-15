export type User = {
	username: string
}

export interface Game {
	appid: number
	name: string
	release_date: string
	required_age: number
	price: number
	discount: number
	dlc_count: number
	detailed_description: string
	about_the_game: string
	short_description: string
	header_image: string
	website: string
	support_url: string
	support_email: string
	windows: boolean
	mac: boolean
	linux: boolean
	metacritic_score: number
	metacritic_url: string
	achievements: number
	recommendations: number
	positive: number
	negative: number
	tags: string[]
}
