<script lang="ts">
	import { TypeWriter } from '$lib/libs/typewriter';
	import { onMount } from 'svelte';
	import {
		searchLocations,
		searchLocationsWithContext,
		fetchWeatherData,
		processWeatherData,
		interpretWeather
	} from '$lib/services';
	import { generateFollowUpSuggestions } from '$lib/services/followUpService';
	import { getWeatherGradient } from '$lib/services/gradientService';
	import { currentToneIndex, getCurrentTone } from '$lib/stores/toneStore';
	import {
		getCachedWeatherData,
		setCachedWeatherData,
		getCachedResponse,
		setCachedResponse
	} from '$lib/stores/weatherCache';
	import { logSearch, getPopularSearches } from '$lib/stores/searchHistory';
	import { getUserLocation } from '$lib/services/geolocationService';
	import SearchSuggestions from './SearchSuggestions.svelte';
	import WeatherSummary from './WeatherSummary.svelte';
	import ToneSwitcher from './ToneSwitcher.svelte';
	import FollowUpSuggestions from './FollowUpSuggestions.svelte';
	import RegenerateButton from './RegenerateButton.svelte';
	import type {
		NominatimResult,
		ProcessedWeatherData,
		FollowUpSuggestion
	} from '$lib/types/weather';
	import type { UserLocation } from '$lib/services/geolocationService';

	interface Props {
		placeholderSuggestions: string[];
		searchIcon?: 'left' | 'none';
		onGradientChange?: (gradient: { background: string; accent: string }) => void;
		onSearchLogged?: () => void;
	}

	const {
		placeholderSuggestions = [],
		searchIcon = 'none',
		onGradientChange,
		onSearchLogged
	}: Props = $props();

	// State
	let query = $state('');
	let suggestions: string[] = $state([]);
	let suggestionsCoords: string[][] = $state([]);
	let weatherSummary: string = $state('');
	let isLoadingWeather: boolean = $state(false);
	let placeholder = $state('');
	let currentWeatherData: ProcessedWeatherData | null = $state(null);
	let currentLocation = $state('');
	let currentCoordinates: { lat: number; lon: number } | null = $state(null);
	let followUpSuggestions: FollowUpSuggestion[] = $state([]);
	let isRegenerating = $state(false);
	let loadingType: 'weather' | 'response' = $state('weather');
	let userLocation: UserLocation | null = $state(null);

	// Debounce
	let typingTimer: ReturnType<typeof setTimeout> | null = null;
	let fetchId: number = 0;

	// Tone change debounce
	let toneChangeTimer: ReturnType<typeof setTimeout> | null = null;

	const debounceSearch = () => {
		if (typingTimer) {
			suggestions = [];
			clearTimeout(typingTimer);
		}

		if (query.length < 3) return;

		typingTimer = setTimeout(async () => {
			const currentId = ++fetchId;
			if (fetchId !== currentId) return;

			try {
				// Use dual search strategy
				const { local, global } = await searchLocationsWithContext(query, userLocation);

				// Combine results: top 3 local + top 2 global
				const combinedResults = [...local.slice(0, 3), ...global.slice(0, 2)];

				// Update suggestions
				suggestions = combinedResults.map((i: NominatimResult) => i.display_name);
				suggestionsCoords = combinedResults.map((i: NominatimResult) => [i.lat, i.lon]);

				console.log(`Search results: ${local.length} local, ${global.length} global`);
			} catch (error) {
				console.error('Error in debounced search:', error);
				// Fallback to original search
				const data = await searchLocations(query);
				suggestions = data.map((i: NominatimResult) => i.display_name);
				suggestionsCoords = data.map((i: NominatimResult) => [i.lat, i.lon]);
			}
		}, 450);
	};

	$effect(debounceSearch);

	const handleSuggestionSelect = async (index: number) => {
		console.log('Selecting location...');
		isLoadingWeather = true;
		weatherSummary = '';
		followUpSuggestions = [];

		// Store location info before clearing suggestions
		currentLocation = suggestions[index] || '';
		const [lat, lon] = suggestionsCoords[index];
		const coordinates = { lat: parseFloat(lat), lon: parseFloat(lon) };
		currentCoordinates = coordinates;
		suggestions = [];

		try {
			// Check cache first
			const cachedData = getCachedWeatherData(coordinates.lat, coordinates.lon);
			let processedData: ProcessedWeatherData;

			if (cachedData) {
				console.log('Using cached weather data');
				loadingType = 'response'; // We have weather data, just need response
				processedData = cachedData.data;
				currentWeatherData = processedData;
			} else {
				console.log('Fetching new weather data');
				loadingType = 'weather'; // Need to fetch weather data
				const weatherData = await fetchWeatherData(coordinates.lat, coordinates.lon);
				processedData = processWeatherData(weatherData);
				currentWeatherData = processedData;

				// Cache the weather data
				setCachedWeatherData(currentLocation, coordinates.lat, coordinates.lon, processedData);
				loadingType = 'response'; // Now generating response
			}

			// Update gradient immediately after we have weather data
			const gradient = getWeatherGradient(processedData);
			onGradientChange?.(gradient);

			// Check for cached response for current tone
			const tone = getCurrentTone($currentToneIndex);
			const cachedResponse = getCachedResponse(coordinates.lat, coordinates.lon, tone.id);

			if (cachedResponse) {
				console.log('Using cached response');
				weatherSummary = cachedResponse;
			} else {
				console.log('Generating new response');
				loadingType = 'response'; // Generating new response
				const summary = await interpretWeather(processedData, tone);
				weatherSummary = summary;
				// Cache the response
				setCachedResponse(coordinates.lat, coordinates.lon, tone.id, summary);
			}

			// Generate follow-up suggestions
			followUpSuggestions = generateFollowUpSuggestions(processedData, currentLocation);

			// Log the successful search
			logSearch(currentLocation);
			onSearchLogged?.();
		} catch (error) {
			console.error('Error fetching weather:', error);
			weatherSummary = 'Sorry, there was an error getting the weather data.';
		} finally {
			isLoadingWeather = false;
		}
	};

	const handleToneChange = async () => {
		if (!currentWeatherData || !currentCoordinates) return;

		// Clear existing timer
		if (toneChangeTimer) {
			clearTimeout(toneChangeTimer);
		}

		// Set loading state immediately for UI feedback
		isLoadingWeather = true;
		loadingType = 'response';

		// Debounce the actual API call
		toneChangeTimer = setTimeout(async () => {
			try {
				const tone = getCurrentTone($currentToneIndex);

				// Check for cached response first
				const cachedResponse = getCachedResponse(
					currentCoordinates.lat,
					currentCoordinates.lon,
					tone.id
				);

				if (cachedResponse) {
					console.log('Using cached tone response');
					weatherSummary = cachedResponse;
				} else {
					console.log('Generating new tone response');
					const summary = await interpretWeather(currentWeatherData, tone);
					weatherSummary = summary;
					// Cache the new response
					setCachedResponse(currentCoordinates.lat, currentCoordinates.lon, tone.id, summary);
				}
			} catch (error) {
				console.error('Error updating tone:', error);
			} finally {
				isLoadingWeather = false;
			}
		}, 500); // 500ms debounce delay
	};

	const handleRegenerate = async () => {
		if (!currentWeatherData || !currentCoordinates) return;

		isRegenerating = true;
		loadingType = 'response'; // Always generating response when regenerating

		try {
			const tone = getCurrentTone($currentToneIndex);
			console.log('Regenerating response');

			// Force new generation, bypassing cache
			const summary = await interpretWeather(currentWeatherData, tone);
			weatherSummary = summary;

			// Update cache with new response
			setCachedResponse(currentCoordinates.lat, currentCoordinates.lon, tone.id, summary);
		} catch (error) {
			console.error('Error regenerating response:', error);
		} finally {
			isRegenerating = false;
		}
	};

	const updatePlaceholder = (text: string): void => {
		placeholder = text;
	};

	onMount(() => {
		const tw = new TypeWriter({
			content: placeholderSuggestions,
			target: updatePlaceholder
		});

		tw.write();

		// Initialize user location
		getUserLocation()
			.then((location) => {
				userLocation = location;
				if (location) {
					console.log('User location detected:', location);
				} else {
					console.log('Could not detect user location');
				}
			})
			.catch((error) => {
				console.warn('Geolocation failed:', error);
			});
	});
</script>

<div class="search-container">
	<div class="searchbar-wrapper">
		<span class="icon {searchIcon}">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="currentColor"
				class="bi bi-search"
				viewBox="0 0 16 16"
			>
				<path
					d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"
				/>
			</svg>
		</span>
		<input bind:value={query} class="search-input" type="text" {placeholder} />
	</div>

	<SearchSuggestions {suggestions} onSelect={handleSuggestionSelect} />

	{#if currentWeatherData}
		<ToneSwitcher onToneChange={handleToneChange} />
	{/if}

	<WeatherSummary
		isLoading={isLoadingWeather}
		summary={weatherSummary}
		{loadingType}
		currentToneIndex={$currentToneIndex}
	/>

	{#if weatherSummary && !isLoadingWeather}
		<RegenerateButton onRegenerate={handleRegenerate} isLoading={isRegenerating} />
	{/if}

	{#if followUpSuggestions.length > 0 && !isLoadingWeather}
		<FollowUpSuggestions
			suggestions={followUpSuggestions}
			weatherData={currentWeatherData}
			location={currentLocation}
			onCustomQuestion={() => {}}
		/>
	{/if}
</div>

<style>
	.search-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.searchbar-wrapper {
		width: 100%;
		max-width: 500px;
		display: flex;
		justify-content: center;
		position: relative;
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.25) 0%,
			rgba(255, 255, 255, 0.15) 50%,
			rgba(255, 255, 255, 0.1) 100%
		);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border-radius: 50px;
		padding: 0.5em;
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1);
		border: none;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.searchbar-wrapper:hover {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.35) 0%,
			rgba(255, 255, 255, 0.25) 50%,
			rgba(255, 255, 255, 0.2) 100%
		);
		box-shadow:
			0 12px 40px rgba(0, 0, 0, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.4),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1);
	}

	.search-input {
		border: none;
		background: transparent;
		padding: 0.8em 1em 0.8em 2.5em;
		outline: none;
		caret-color: white;
		width: 100%;
		color: white;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
			'Helvetica Neue', sans-serif;
		font-size: 1.2em;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.search-input::placeholder {
		color: rgba(255, 255, 255, 0.7);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.search-input:focus {
		color: white;
	}

	.icon {
		position: absolute;
		left: 1.2em;
		top: 50%;
		transform: translateY(-50%);
		width: 1.2em;
		color: rgba(255, 255, 255, 0.8);
		pointer-events: none;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
	}

	.icon.left {
		display: block;
	}

	.icon.none {
		display: none;
	}
</style>
