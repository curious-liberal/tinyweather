import { browser } from '$app/environment';

export interface UserLocation {
	country: string;
	city?: string;
	region?: string;
	countryCode: string;
	latitude?: number;
	longitude?: number;
}

// Cache user location to avoid repeated API calls
let cachedLocation: UserLocation | null = null;
let locationFetchPromise: Promise<UserLocation | null> | null = null;

export async function getUserLocation(): Promise<UserLocation | null> {
	if (!browser) return null;

	// Return cached location if available
	if (cachedLocation) {
		return cachedLocation;
	}

	// If already fetching, return the existing promise
	if (locationFetchPromise) {
		return locationFetchPromise;
	}

	// Start new fetch
	locationFetchPromise = fetchUserLocation();
	const result = await locationFetchPromise;

	// Cache the result
	cachedLocation = result;
	locationFetchPromise = null;

	return result;
}

async function fetchUserLocation(): Promise<UserLocation | null> {
	try {
		// Using ipapi.co for free IP geolocation
		const response = await fetch('https://ipapi.co/json/', {
			method: 'GET',
			headers: {
				'Accept': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		// Check if we got an error response
		if (data.error) {
			console.warn('IP geolocation error:', data.error);
			return null;
		}

		// Extract location information
		const location: UserLocation = {
			country: data.country_name || data.country || 'Unknown',
			city: data.city,
			region: data.region,
			countryCode: data.country_code || data.country,
			latitude: data.latitude,
			longitude: data.longitude
		};

		console.log('Detected user location:', location);
		return location;

	} catch (error) {
		console.warn('Failed to get user location:', error);
		return null;
	}
}

// Get location context for search enhancement
export function getLocationContext(userLocation: UserLocation | null): string {
	if (!userLocation) return '';

	// Build location context string
	const parts: string[] = [];

	if (userLocation.city) {
		parts.push(userLocation.city);
	}

	if (userLocation.region && userLocation.region !== userLocation.city) {
		parts.push(userLocation.region);
	}

	if (userLocation.country) {
		parts.push(userLocation.country);
	}

	return parts.join(', ');
}

// Clear cached location (useful for testing or if user wants to refresh)
export function clearLocationCache(): void {
	cachedLocation = null;
	locationFetchPromise = null;
}

// Check if location detection is supported
export function isGeolocationSupported(): boolean {
	return browser && typeof fetch !== 'undefined';
}