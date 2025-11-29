import { fetchWeatherApi } from "openmeteo";
import type { WeatherData, ProcessedWeatherData } from "$lib/types/weather";

export async function fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
	const params = {
		latitude,
		longitude,
		hourly: [
			"temperature_2m", "precipitation_probability", "precipitation", "relative_humidity_2m",
			"dew_point_2m", "apparent_temperature", "rain", "showers", "snowfall", "snow_depth",
			"cloud_cover", "cloud_cover_low", "cloud_cover_mid", "cloud_cover_high", "visibility",
			"evapotranspiration", "temperature_180m", "temperature_120m", "temperature_80m",
			"wind_gusts_10m", "wind_direction_180m", "wind_direction_120m", "wind_speed_10m",
			"wind_speed_80m", "wind_speed_180m", "wind_speed_120m", "wind_direction_10m",
			"wind_direction_80m"
		],
	};

	const url = "https://api.open-meteo.com/v1/forecast";
	const responses = await fetchWeatherApi(url, params);
	const response = responses[0];

	const latitude_result = response.latitude();
	const longitude_result = response.longitude();
	const elevation = response.elevation();
	const utcOffsetSeconds = response.utcOffsetSeconds();

	console.log(
		`\nCoordinates: ${latitude_result}°N ${longitude_result}°E`,
		`\nElevation: ${elevation}m asl`,
		`\nTimezone difference to GMT+0: ${utcOffsetSeconds}s`,
	);

	const hourly = response.hourly()!;

	return {
		hourly: {
			time: Array.from(
				{ length: (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval() },
				(_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
			),
			temperature_2m: hourly.variables(0)!.valuesArray(),
			precipitation_probability: hourly.variables(1)!.valuesArray(),
			precipitation: hourly.variables(2)!.valuesArray(),
			relative_humidity_2m: hourly.variables(3)!.valuesArray(),
			dew_point_2m: hourly.variables(4)!.valuesArray(),
			apparent_temperature: hourly.variables(5)!.valuesArray(),
			rain: hourly.variables(6)!.valuesArray(),
			showers: hourly.variables(7)!.valuesArray(),
			snowfall: hourly.variables(8)!.valuesArray(),
			snow_depth: hourly.variables(9)!.valuesArray(),
			cloud_cover: hourly.variables(10)!.valuesArray(),
			cloud_cover_low: hourly.variables(11)!.valuesArray(),
			cloud_cover_mid: hourly.variables(12)!.valuesArray(),
			cloud_cover_high: hourly.variables(13)!.valuesArray(),
			visibility: hourly.variables(14)!.valuesArray(),
			evapotranspiration: hourly.variables(15)!.valuesArray(),
			temperature_180m: hourly.variables(16)!.valuesArray(),
			temperature_120m: hourly.variables(17)!.valuesArray(),
			temperature_80m: hourly.variables(18)!.valuesArray(),
			wind_gusts_10m: hourly.variables(19)!.valuesArray(),
			wind_direction_180m: hourly.variables(20)!.valuesArray(),
			wind_direction_120m: hourly.variables(21)!.valuesArray(),
			wind_speed_10m: hourly.variables(22)!.valuesArray(),
			wind_speed_80m: hourly.variables(23)!.valuesArray(),
			wind_speed_180m: hourly.variables(24)!.valuesArray(),
			wind_speed_120m: hourly.variables(25)!.valuesArray(),
			wind_direction_10m: hourly.variables(26)!.valuesArray(),
			wind_direction_80m: hourly.variables(27)!.valuesArray(),
		},
	};
}

export function processWeatherData(raw: WeatherData): ProcessedWeatherData {
	const h = raw.hourly;

	// Next 24 hours slice
	const next24 = {
		temp: Array.from(h.temperature_2m ?? []).slice(0, 24),
		rainProb: Array.from(h.precipitation_probability ?? []).slice(0, 24),
		rain: Array.from(h.precipitation ?? []).slice(0, 24),
		clouds: Array.from(h.cloud_cover ?? []).slice(0, 24),
		wind: Array.from(h.wind_speed_10m ?? []).slice(0, 24),
		humidity: Array.from(h.relative_humidity_2m ?? []).slice(0, 24),
		times: h.time.slice(0, 24)
	};

	// Safety: filter out NaN or non-numbers
	const safe = (arr: number[]) => arr.filter(x => typeof x === "number" && !isNaN(x));

	const tempArr = safe(next24.temp);
	const rainProbArr = safe(next24.rainProb);
	const rainArr = safe(next24.rain);
	const cloudArr = safe(next24.clouds);
	const windArr = safe(next24.wind);

	return {
		period: "next 24 hours",

		temperature: {
			now: tempArr[0],
			high: Math.max(...tempArr),
			low: Math.min(...tempArr),
			trend: tempArr[23] - tempArr[0] > 0 ? "warming" : "cooling"
		},

		precipitation: {
			maxChance: Math.max(...rainProbArr),
			peakHour: next24.times[rainProbArr.indexOf(Math.max(...rainProbArr))]?.toISOString() ?? null,
			totalRain: rainArr.reduce((a, b) => a + b, 0)
		},

		clouds: {
			avg: Math.round(cloudArr.reduce((a, b) => a + b, 0) / cloudArr.length),
			trend: cloudArr[23] > cloudArr[0] ? "clouds increasing" : cloudArr[23] < cloudArr[0] ? "clearing" : "steady"
		},

		wind: {
			max: Math.max(...windArr),
			avg: Math.round(windArr.reduce((a, b) => a + b, 0) / windArr.length),
			conditions: Math.max(...windArr) > 12 ? "strong winds" : Math.max(...windArr) > 7 ? "breezy" : "light winds"
		},

		summaryHints: [
			Math.max(...rainProbArr) > 60 ? "likely rain" : "mostly dry",
			Math.max(...windArr) > 12 ? "windy" : "not very windy",
			Math.max(...cloudArr) < 30 ? "sunny periods" : "cloudy"
		]
	};
}