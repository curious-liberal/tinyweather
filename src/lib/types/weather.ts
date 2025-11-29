export interface NominatimResult {
	place_id: number;
	licence: string;
	osm_type: 'node' | 'way' | 'relation';
	osm_id: number;
	lat: string;
	lon: string;
	category: string;
	type: string;
	place_rank: number;
	importance: number;
	addresstype: string;
	name: string;
	display_name: string;
	boundingbox: [string, string, string, string];
	address?: {
		country?: string;
		country_code?: string;
		state?: string;
		region?: string;
		county?: string;
		city?: string;
		town?: string;
	};
}

export interface WeatherData {
	hourly: {
		time: Date[];
		temperature_2m: Float32Array | null;
		precipitation_probability: Float32Array | null;
		precipitation: Float32Array | null;
		cloud_cover: Float32Array | null;
		wind_speed_10m: Float32Array | null;
		relative_humidity_2m: Float32Array | null;
	};
}

export interface ProcessedWeatherData {
	period: string;
	temperature: {
		now: number;
		high: number;
		low: number;
		trend: string;
	};
	precipitation: {
		maxChance: number;
		peakHour: string | null;
		totalRain: number;
	};
	clouds: {
		avg: number;
		trend: string;
	};
	wind: {
		max: number;
		avg: number;
		conditions: string;
	};
	summaryHints: string[];
}

export interface FollowUpSuggestion {
	id: string;
	text: string;
	prompt: string;
	emoji: string;
}
