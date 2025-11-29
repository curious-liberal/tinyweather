<script lang="ts">
	import { TypeWriter } from '$lib/libs/typewriter';
	import { onMount } from 'svelte';
	import { searchLocations, fetchWeatherData, processWeatherData, interpretWeather } from '$lib/services';
	import SearchSuggestions from './SearchSuggestions.svelte';
	import WeatherSummary from './WeatherSummary.svelte';
	import type { NominatimResult } from '$lib/types/weather';

	interface Props {
		placeholderSuggestions: string[];
		searchIcon?: "left" | "none";
	}

	const { placeholderSuggestions = [], searchIcon = "none" }: Props = $props();

	// State
	let query = $state("");
	let suggestions: string[] = $state([]);
	let suggestionsCoords: string[][] = $state([]);
	let weatherSummary: string = $state("");
	let isLoadingWeather: boolean = $state(false);
	let placeholder = $state('');

	// Debounce
	let typingTimer: ReturnType<typeof setTimeout> | null = null;
	let fetchId: number = 0;

	const debounceSearch = () => {
		if (typingTimer) {
			suggestions = [];
			clearTimeout(typingTimer);
		}

		if (query.length < 3) return;

		typingTimer = setTimeout(async () => {
			const currentId = ++fetchId;
			if (fetchId !== currentId) return;

			const data = await searchLocations(query);
			suggestions = data.map((i: NominatimResult) => i.display_name);
			suggestionsCoords = data.map((i: NominatimResult) => [i.lat, i.lon]);
		}, 450);
	};

	$effect(debounceSearch);

	const handleSuggestionSelect = async (index: number) => {
		console.log("Grabbing weather...");
		isLoadingWeather = true;
		weatherSummary = "";
		suggestions = [];

		try {
			const [lat, lon] = suggestionsCoords[index];
			const weatherData = await fetchWeatherData(parseFloat(lat), parseFloat(lon));
			const processedData = processWeatherData(weatherData);
			const summary = await interpretWeather(processedData);
			weatherSummary = summary;
		} catch (error) {
			console.error("Error fetching weather:", error);
			weatherSummary = "Sorry, there was an error getting the weather data.";
		} finally {
			isLoadingWeather = false;
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
	});
</script>

<div class="search-container">
	<div class="searchbar-wrapper">
		<span class="icon {searchIcon}">
			<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
				<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
			</svg>
		</span>
		<input bind:value={query} class="search-input" type="text" {placeholder} />
	</div>

	<SearchSuggestions {suggestions} onSelect={handleSuggestionSelect} />
	<WeatherSummary isLoading={isLoadingWeather} summary={weatherSummary} />
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
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border-radius: 50px;
		padding: 0.5em;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.search-input {
		border: none;
		background: transparent;
		padding: 0.8em 1em 0.8em 2.5em;
		outline: none;
		caret-color: #667eea;
		width: 100%;
		color: #333;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		font-size: 1.2em;
	}

	.search-input::placeholder {
		color: #999;
	}

	.search-input:focus {
		color: #333;
	}

	.icon {
		position: absolute;
		left: 1.2em;
		top: 50%;
		transform: translateY(-50%);
		width: 1.2em;
		color: #666;
		pointer-events: none;
	}

	.icon.left {
		display: block;
	}

	.icon.none {
		display: none;
	}
</style>