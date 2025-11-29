import type { NominatimResult } from "$lib/types/weather";
import type { UserLocation } from './geolocationService';

export async function searchLocations(query: string, limit: number = 3): Promise<NominatimResult[]> {
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
		const isNotBusiness = !displayName.includes('ltd') &&
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
): Promise<{ local: NominatimResult[], global: NominatimResult[] }> {
	try {
		if (!userLocation?.country) {
			// No country - just do global search
			const globalResults = await searchLocations(query, 5);
			return {
				local: [],
				global: globalResults
			};
		}

		// Do local search first (with country)
		const localQuery = `${query}, ${userLocation.country}`;
		const localResults = await searchLocations(localQuery, 3);

		// If we got some local results, add global ones to fill up to 5 total
		const remainingSlots = 5 - localResults.length;
		let globalResults: NominatimResult[] = [];

		if (remainingSlots > 0) {
			const allGlobalResults = await searchLocations(query, remainingSlots + 2); // Get a few extra
			// Filter out any that match local results by display name
			const localDisplayNames = new Set(localResults.map(r => r.display_name));
			globalResults = allGlobalResults
				.filter(r => !localDisplayNames.has(r.display_name))
				.slice(0, remainingSlots);
		}

		return {
			local: localResults,
			global: globalResults
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

function getLocationContext(userLocation: UserLocation): string {
	// Just use country for broader local context
	return userLocation.country || '';
}