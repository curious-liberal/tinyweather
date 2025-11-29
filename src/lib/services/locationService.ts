import type { NominatimResult } from '$lib/types/weather';
import type { UserLocation } from './geolocationService';

export async function searchLocations(
	query: string,
	limit: number = 3
): Promise<NominatimResult[]> {
	const params = new URLSearchParams({
		q: query,
		format: 'jsonv2',
		limit: (limit * 2).toString(), // Get extra to filter from
		addressdetails: '1',
		'accept-language': 'en'
	});

	// Simple search without overly restrictive filters
	const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
	const results = await response.json();

	// Basic filtering to remove obvious businesses/addresses
	const filtered = results.filter((result: NominatimResult) => {
		const displayName = result.display_name.toLowerCase();
		const category = result.category?.toLowerCase() || '';

		// Remove obvious businesses and addresses with numbers
		const isNotBusiness =
			!displayName.includes('ltd') &&
			!displayName.includes('&') &&
			!displayName.includes('centre') &&
			!displayName.includes('shop') &&
			category !== 'shop' &&
			category !== 'amenity';

		const isNotAddress = !displayName.match(/^\d+/); // Not starting with house number

		return isNotBusiness && isNotAddress;
	});

	return filtered.slice(0, limit);
}

export async function searchLocationsWithContext(
	query: string,
	userLocation: UserLocation | null
): Promise<{ local: NominatimResult[]; global: NominatimResult[] }> {
	try {
		const ranked = await searchAndRankLocations(query, userLocation, 8);
		return {
			local: ranked.slice(0, 3),
			global: ranked.slice(3, 8)
		};
	} catch (error) {
		console.error('Error in location search:', error);
		const fallbackResults = await searchLocations(query, 5);
		return {
			local: [],
			global: fallbackResults
		};
	}
}

export async function searchAndRankLocations(
	query: string,
	userLocation: UserLocation | null,
	limit: number = 8
): Promise<NominatimResult[]> {
	const rawResults = await searchLocations(query, Math.max(10, limit + 4));
	return rankLocations(rawResults, query, userLocation).slice(0, limit);
}

export function rankLocations(
	results: NominatimResult[],
	query: string,
	userLocation: UserLocation | null
): NominatimResult[] {
	const merged = mergeByPlaceId(results);
	const scored = merged.map((result) => ({
		result,
		distance: userLocation ? distanceToUser(result, userLocation) : null,
		prefixMatch: isPrefixMatch(result, query),
		countryMatch: isCountryMatch(result, userLocation)
	}));

	scored.sort((a, b) => {
		if (a.prefixMatch !== b.prefixMatch) {
			return a.prefixMatch ? -1 : 1;
		}

		if (a.countryMatch !== b.countryMatch) {
			return a.countryMatch ? -1 : 1;
		}

		const aHasDistance = typeof a.distance === 'number';
		const bHasDistance = typeof b.distance === 'number';

		if (aHasDistance && bHasDistance) {
			return (a.distance ?? 0) - (b.distance ?? 0);
		}

		if (aHasDistance) return -1;
		if (bHasDistance) return 1;

		return (b.result.importance ?? 0) - (a.result.importance ?? 0);
	});

	return scored.map((item) => item.result);
}

function mergeByPlaceId(results: NominatimResult[]): NominatimResult[] {
	const seen = new Set<number>();
	const deduped: NominatimResult[] = [];

	for (const item of results) {
		if (seen.has(item.place_id)) continue;
		seen.add(item.place_id);
		deduped.push(item);
	}

	return deduped;
}

function distanceToUser(result: NominatimResult, userLocation: UserLocation): number | null {
	const lat = Number.parseFloat(result.lat);
	const lon = Number.parseFloat(result.lon);

	if (
		Number.isNaN(lat) ||
		Number.isNaN(lon) ||
		userLocation.latitude === undefined ||
		userLocation.longitude === undefined
	) {
		return null;
	}

	return haversine(userLocation.latitude, userLocation.longitude, lat, lon);
}

// Rough distance in km between two lat/lon points
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const toRad = (value: number) => (value * Math.PI) / 180;

	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return 6371 * c;
}

function isPrefixMatch(result: NominatimResult, query: string): boolean {
	const normalizedQuery = query.trim().toLowerCase();
	if (!normalizedQuery) return false;

	const nameParts = [
		result.name,
		result.display_name?.split(',')[0],
		result.address?.city,
		result.address?.town
	]
		.filter(Boolean)
		.map((s) => s!.toLowerCase());

	return nameParts.some((part) => part.startsWith(normalizedQuery));
}

function isCountryMatch(result: NominatimResult, userLocation: UserLocation | null): boolean {
	if (!userLocation) return false;

	const target = (userLocation.countryCode || userLocation.country || '').toLowerCase();
	if (!target) return false;

	const resultCountry =
		result.address?.country_code?.toLowerCase() || result.address?.country?.toLowerCase() || '';

	return Boolean(resultCountry) && resultCountry === target;
}
