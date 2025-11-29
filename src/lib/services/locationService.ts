import type { NominatimResult } from "$lib/types/weather";

export async function searchLocations(query: string): Promise<NominatimResult[]> {
	const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=jsonv2&limit=3`);
	return await response.json();
}