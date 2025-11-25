<script lang="ts">
	import { TypeWriter } from '$lib/libs/typewriter';
	import { onMount } from 'svelte';

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

	const grabWeather = (index: number) => {
		console.log(`Grabbing weather for ${suggestions[index]} at location ${suggestionsCoords[index][0]} ${suggestionsCoords[index][1]}`)
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