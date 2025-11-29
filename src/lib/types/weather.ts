export interface NominatimResult {
	place_id: number;
	licence: string;
	osm_type: "node" | "way" | "relation";
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
}

export interface WeatherData {
	hourly: {
		time: Date[];
		temperature_2m: Float32Array | null;
		precipitation_probability: Float32Array | null;
		precipitation: Float32Array | null;
		relative_humidity_2m: Float32Array | null;
		dew_point_2m: Float32Array | null;
		apparent_temperature: Float32Array | null;
		rain: Float32Array | null;
		showers: Float32Array | null;
		snowfall: Float32Array | null;
		snow_depth: Float32Array | null;
		cloud_cover: Float32Array | null;
		cloud_cover_low: Float32Array | null;
		cloud_cover_mid: Float32Array | null;
		cloud_cover_high: Float32Array | null;
		visibility: Float32Array | null;
		evapotranspiration: Float32Array | null;
		temperature_180m: Float32Array | null;
		temperature_120m: Float32Array | null;
		temperature_80m: Float32Array | null;
		wind_gusts_10m: Float32Array | null;
		wind_direction_180m: Float32Array | null;
		wind_direction_120m: Float32Array | null;
		wind_direction_80m: Float32Array | null;
		wind_direction_10m: Float32Array | null;
		wind_speed_10m: Float32Array | null;
		wind_speed_80m: Float32Array | null;
		wind_speed_180m: Float32Array | null;
		wind_speed_120m: Float32Array | null;
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