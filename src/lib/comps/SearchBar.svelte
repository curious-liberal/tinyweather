<script lang="ts">
	import { TypeWriter } from '$lib/libs/typewriter';
	import { onMount } from 'svelte';

	const {suggestions = [], searchIcon = "none"} = $props<{
		suggestions: string[],
		searchIcon?: "left" | "none"
	}>();

	let placeholder = $state('');

	const updatePlaceholder = (text: string): void => {
		placeholder = text;
	};

	onMount(() => {
		const tw = new TypeWriter({
			content: suggestions,
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
	<input class="search-input" type="text" {placeholder} />
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
</style>