<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<title>Tiny Weather</title>
	<meta
		name="description"
		content="Tiny Weather — fast AI-powered weather summaries with personality, tone control, and smart follow-ups."
	/>
	<link rel="icon" type="image/svg+xml" href={favicon} />
	<link rel="preconnect" href="https://nominatim.openstreetmap.org" />
	<link rel="preconnect" href="https://api.open-meteo.com" />
</svelte:head>

{@render children()}

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
			'Helvetica Neue', sans-serif;
	}

	:global(.emoji) {
		font-family: 'Apple Color Emoji', 'Twemoji Mozilla', 'Noto Color Emoji', 'Segoe UI Emoji', 'EmojiOne Color',
			sans-serif;
		font-synthesis: none;
	}
</style>
