import { writable } from 'svelte/store';
import type { ProcessedWeatherData } from '$lib/types/weather';

export interface CachedWeatherData {
	location: string;
	coordinates: { lat: number; lon: number };
	data: ProcessedWeatherData;
	timestamp: number;
	responses: Record<string, string>; // toneId -> response
}

export interface WeatherCache {
	[locationKey: string]: CachedWeatherData;
}

// Cache duration: 30 minutes
const CACHE_DURATION = 30 * 60 * 1000;

export const weatherCache = writable<WeatherCache>({});

function generateLocationKey(lat: number, lon: number): string {
	// Round to 2 decimal places to create consistent keys for nearby locations
	return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

export function getCachedWeatherData(lat: number, lon: number): CachedWeatherData | null {
	const locationKey = generateLocationKey(lat, lon);

	weatherCache.subscribe((cache) => {
		const cached = cache[locationKey];
		if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
			return cached;
		}
		return null;
	})();

	// Direct cache access for synchronous operation
	let currentCache: WeatherCache = {};
	weatherCache.subscribe((cache) => (currentCache = cache))();

	const cached = currentCache[locationKey];
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached;
	}

	return null;
}

export function setCachedWeatherData(
	location: string,
	lat: number,
	lon: number,
	data: ProcessedWeatherData
): void {
	const locationKey = generateLocationKey(lat, lon);

	weatherCache.update((cache) => ({
		...cache,
		[locationKey]: {
			location,
			coordinates: { lat, lon },
			data,
			timestamp: Date.now(),
			responses: {}
		}
	}));
}

export function getCachedResponse(lat: number, lon: number, toneId: string): string | null {
	const cached = getCachedWeatherData(lat, lon);
	return cached?.responses[toneId] || null;
}

export function setCachedResponse(
	lat: number,
	lon: number,
	toneId: string,
	response: string
): void {
	const locationKey = generateLocationKey(lat, lon);

	weatherCache.update((cache) => {
		const existing = cache[locationKey];
		if (!existing) return cache;

		return {
			...cache,
			[locationKey]: {
				...existing,
				responses: {
					...existing.responses,
					[toneId]: response
				}
			}
		};
	});
}

export function clearExpiredCache(): void {
	weatherCache.update((cache) => {
		const now = Date.now();
		const cleaned: WeatherCache = {};

		Object.entries(cache).forEach(([key, data]) => {
			if (now - data.timestamp < CACHE_DURATION) {
				cleaned[key] = data;
			}
		});

		return cleaned;
	});
}

export function clearAllCache(): void {
	weatherCache.set({});
}

// Automatically clean expired cache every 5 minutes
if (typeof window !== 'undefined') {
	setInterval(clearExpiredCache, 5 * 60 * 1000);
}
