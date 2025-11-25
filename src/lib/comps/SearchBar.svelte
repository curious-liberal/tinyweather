<script lang="ts">
	import { TypeWriter } from '$lib/libs/typewriter';
	import { onMount } from 'svelte';
	import {fetchWeatherApi} from "openmeteo"

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


	// Search query
	let query = $state("")

	// Debounce
	let suggestions: string[] = $state([])
	let suggestionsCoords: string[] = $state([])
	let typingTimer: ReturnType<typeof setTimeout> | null = null
	let fetchId: number = 0
	const debounceSearch = () => {
		if (typingTimer) {
			suggestions = []
			clearTimeout(typingTimer)
		}

		if (query.length < 3) return

		typingTimer = setTimeout(async () => {
			const currentId = ++fetchId
			if (fetchId != currentId) return
			const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=jsonv2&limit=3`)
			const data = await res.json()
			suggestions = data.map((i: NominatimResult) => i.display_name)
			suggestionsCoords = data.map((i: NominatimResult) => [i.lat, i.lon])
		}, 450)
	}

	$effect(debounceSearch)

	// Grab weather given index (place in suggestionCoords array)
	const grabWeather = async (index: number) => {
		console.log("Grabbing weather...")
		suggestions = []
		const params = {
			latitude: suggestionsCoords[index][0],
			longitude: suggestionsCoords[index][1],
			hourly: ["temperature_2m", "precipitation_probability", "precipitation", "relative_humidity_2m", "dew_point_2m", "apparent_temperature", "rain", "showers", "snowfall", "snow_depth", "cloud_cover", "cloud_cover_low", "cloud_cover_mid", "cloud_cover_high", "visibility", "evapotranspiration", "temperature_180m", "temperature_120m", "temperature_80m", "wind_gusts_10m", "wind_direction_180m", "wind_direction_120m", "wind_speed_10m", "wind_speed_80m", "wind_speed_180m", "wind_speed_120m", "wind_direction_10m", "wind_direction_80m"],
		}
		const url = "https://api.open-meteo.com/v1/forecast"
		const responses = await fetchWeatherApi(url, params)

		// Process first location. Add a for-loop for multiple locations or weather models
		const response = responses[0];

		// Attributes for timezone and location
		const latitude = response.latitude();
		const longitude = response.longitude();
		const elevation = response.elevation();
		const utcOffsetSeconds = response.utcOffsetSeconds();

		console.log(
			`\nCoordinates: ${latitude}°N ${longitude}°E`,
			`\nElevation: ${elevation}m asl`,
			`\nTimezone difference to GMT+0: ${utcOffsetSeconds}s`,
		);

		const hourly = response.hourly()!;

		// Note: The order of weather variables in the URL query and the indices below need to match!
		const weatherData = {
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
		}

		// Pass off to LLM
		interpretWeather(weatherData)
	}

	const interpretWeather = (weather: WeatherData) => {
		console.log("Do something with this weather", weather)
	}

	// Typewriter placeholder
	const {placeholderSuggestions = [], searchIcon = "none"} = $props<{
		placeholderSuggestions: string[],
		searchIcon?: "left" | "none"
	}>();

	let placeholder = $state('');

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

<div class="searchbar-wrapper">
	<span class="icon {searchIcon}">
		<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
			<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
		</svg>
	</span>
	<input bind:value={query} class="search-input" type="text" {placeholder} />
</div>
<div class="suggestions-wrapper">
	{#each suggestions as suggestion, index}
		<p onclick={() => grabWeather(index)}>{suggestion}</p>
	{/each}
</div>


<style>
	.searchbar-wrapper {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.search-input {
		border: none;
		border-bottom: 4px solid #ccc;
		padding: 0 0 0.3em 1.7em;
		outline: none;
		caret-color: transparent;

		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		font-size: 2em;
	}

	.search-input::placeholder {
		color: #ccc;
	}

	.search-input:focus {
		border-color: #909090;
	}

	.icon {
		position: relative;
		top: 0.4em;
		width: 1.8em;
		color: #ccc;
	}

	.icon.left {
		left: 2.5em;
	}

	.icon.none {
		display: none;
	}

	@keyframes fade-in {
		0% {
			opacity: 0;
			color: rgb(4, 6, 47);
		}

		100% {
			opacity: 100;
			color: black;
		}
	}

	@keyframes fade-in-up {
		0% {
			transform: translateY(3em);
			opacity: 0;
			color: rgb(4, 6, 47);
		}

		100% {
			opacity: 100;
			color: black;
		}
	}

	.suggestions-wrapper {
		text-align: center;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		font-size: larger;
	}

	.suggestions-wrapper p {
		animation: fade-in-up 2s;
	}
</style>