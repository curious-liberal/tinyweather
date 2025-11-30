<script lang="ts">
	import { onMount } from 'svelte';
	import Searchbar from '$lib/comps/SearchBar.svelte';
	import { getPopularSearches } from '$lib/stores/searchHistory';
	import confetti from 'canvas-confetti';

	let placeholderSuggestions = $state(['London', 'Glasgow', 'Birmingham', 'Norwich', 'Malta']);

	const updatePlaceholderSuggestions = () => {
		placeholderSuggestions = getPopularSearches(5);
	};

	// Triple tap confetti
	let tapCount = $state(0);
	let tapTimeout: ReturnType<typeof setTimeout> | null = null;

	const handleFooterClick = () => {
		tapCount++;

		if (tapTimeout) clearTimeout(tapTimeout);

		if (tapCount === 3) {
			// Trigger confetti!
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.9 }
			});
			tapCount = 0;
		} else {
			// Reset tap count after 1 second
			tapTimeout = setTimeout(() => {
				tapCount = 0;
			}, 1000);
		}
	};

	onMount(() => {
		// Update placeholder suggestions with popular searches
		updatePlaceholderSuggestions();
	});

	// Simple day/night gradient
	const hour = new Date().getHours();
	const isNight = hour >= 20 || hour <= 7;

let initialGradient: string;
if (isNight) {
	// Night: clean dark gradient
	initialGradient = 'linear-gradient(135deg, #2C3E50 0%, #191970 100%)';
} else {
		// Day: clean bright gradient
		initialGradient = 'linear-gradient(135deg, #87CEEB 0%, #FFE4B5 100%)';
}

	let gradientA = $state(initialGradient);
	let gradientB = $state(initialGradient);
	let activeLayer: 'a' | 'b' = $state('a');
	const fadeDuration = 1800;

	const handleGradientChange = (gradient: { background: string; accent: string }) => {
		if (activeLayer === 'a') {
			gradientB = gradient.background;
			activeLayer = 'b';
		} else {
			gradientA = gradient.background;
			activeLayer = 'a';
		}
	};
</script>

<div class="wrapper">
	<div
		class="bg bg-a"
		style="background: {gradientA}; opacity: {activeLayer === 'a' ? 1 : 0}; transition-duration: {fadeDuration}ms;"
	></div>
	<div
		class="bg bg-b"
		style="background: {gradientB}; opacity: {activeLayer === 'b' ? 1 : 0}; transition-duration: {fadeDuration}ms;"
	></div>

	{#if isNight}
		<div class="stars"></div>
	{/if}

	<div class="content">
		<div class="header">
			<h1 class="title">TinyWeather</h1>
			<p class="subtitle">AI-powered weather with personality</p>
		</div>
		<Searchbar
			{placeholderSuggestions}
			searchIcon="left"
			onGradientChange={handleGradientChange}
			onSearchLogged={updatePlaceholderSuggestions}
		/>
		<button class="footer" type="button" onclick={handleFooterClick}>
			Made with love by Curiio
		</button>
	</div>
</div>

<style>
	.wrapper {
		min-height: 100vh;
		display: flex;
		position: relative;
		overflow: hidden;
	}

	.bg {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition-property: opacity;
		pointer-events: none;
		z-index: 0;
	}

	.bg::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			circle at 20% 50%,
			rgba(255, 255, 255, 0.03) 0%,
			transparent 50%,
			rgba(255, 255, 255, 0.01) 100%
		);
		animation: subtleGlow 12s ease-in-out infinite alternate;
		pointer-events: none;
	}

	.stars {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
		overflow: hidden;
	}

	.stars::before,
	.stars::after {
		content: '';
		position: absolute;
		width: 1.5px;
		height: 1.5px;
		background: white;
		border-radius: 50%;
		box-shadow:
			15vw 20vh 0 0 rgba(255, 255, 255, 0.7),
			30vw 10vh 0 0 rgba(255, 255, 255, 0.8),
			45vw 25vh 0 0 rgba(255, 255, 255, 0.6),
			60vw 15vh 0 0 rgba(255, 255, 255, 0.7),
			75vw 30vh 0 0 rgba(255, 255, 255, 0.5),
			85vw 5vh 0 0 rgba(255, 255, 255, 0.8),
			10vw 40vh 0 0 rgba(255, 255, 255, 0.6),
			25vw 50vh 0 0 rgba(255, 255, 255, 0.7),
			40vw 45vh 0 0 rgba(255, 255, 255, 0.8),
			55vw 55vh 0 0 rgba(255, 255, 255, 0.6),
			70vw 60vh 0 0 rgba(255, 255, 255, 0.7),
			90vw 35vh 0 0 rgba(255, 255, 255, 0.5),
			5vw 70vh 0 0 rgba(255, 255, 255, 0.7),
			20vw 65vh 0 0 rgba(255, 255, 255, 0.8),
			35vw 75vh 0 0 rgba(255, 255, 255, 0.6),
			50vw 80vh 0 0 rgba(255, 255, 255, 0.7),
			65vw 70vh 0 0 rgba(255, 255, 255, 0.8),
			80vw 85vh 0 0 rgba(255, 255, 255, 0.6),
			12vw 12vh 0 0 rgba(255, 255, 255, 0.7),
			38vw 8vh 0 0 rgba(255, 255, 255, 0.6),
			62vw 38vh 0 0 rgba(255, 255, 255, 0.8),
			88vw 58vh 0 0 rgba(255, 255, 255, 0.5),
			18vw 88vh 0 0 rgba(255, 255, 255, 0.7),
			48vw 28vh 0 0 rgba(255, 255, 255, 0.6),
			78vw 18vh 0 0 rgba(255, 255, 255, 0.8),
			8vw 48vh 0 0 rgba(255, 255, 255, 0.7),
			33vw 63vh 0 0 rgba(255, 255, 255, 0.6),
			58vw 33vh 0 0 rgba(255, 255, 255, 0.8),
			83vw 73vh 0 0 rgba(255, 255, 255, 0.5),
			28vw 83vh 0 0 rgba(255, 255, 255, 0.7);
		animation: twinkle 8s ease-in-out infinite;
	}

	.stars::after {
		width: 1px;
		height: 1px;
		box-shadow:
			22vw 17vh 0 0 rgba(255, 255, 255, 0.5),
			42vw 27vh 0 0 rgba(255, 255, 255, 0.6),
			52vw 7vh 0 0 rgba(255, 255, 255, 0.4),
			67vw 37vh 0 0 rgba(255, 255, 255, 0.5),
			82vw 47vh 0 0 rgba(255, 255, 255, 0.4),
			92vw 22vh 0 0 rgba(255, 255, 255, 0.6),
			17vw 52vh 0 0 rgba(255, 255, 255, 0.5),
			37vw 62vh 0 0 rgba(255, 255, 255, 0.4),
			47vw 42vh 0 0 rgba(255, 255, 255, 0.6),
			72vw 72vh 0 0 rgba(255, 255, 255, 0.5),
			87vw 57vh 0 0 rgba(255, 255, 255, 0.4),
			2vw 82vh 0 0 rgba(255, 255, 255, 0.6),
			27vw 77vh 0 0 rgba(255, 255, 255, 0.5),
			57vw 87vh 0 0 rgba(255, 255, 255, 0.4),
			77vw 67vh 0 0 rgba(255, 255, 255, 0.6),
			97vw 92vh 0 0 rgba(255, 255, 255, 0.5),
			14vw 14vh 0 0 rgba(255, 255, 255, 0.4),
			44vw 24vh 0 0 rgba(255, 255, 255, 0.5),
			64vw 44vh 0 0 rgba(255, 255, 255, 0.6),
			84vw 64vh 0 0 rgba(255, 255, 255, 0.4);
		animation: twinkle 6s ease-in-out infinite 2s;
	}

	@keyframes twinkle {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding: 3em 2.5em 2.5em;
		color: white;
		position: relative;
		z-index: 1;
		width: 100%;
	}

	.content::before {
		content: none;
	}

	/* Subtle glow stays on content layer */
	.wrapper::before,
	.wrapper::after {
		background-blend-mode: normal;
	}

	.header {
		text-align: center;
		margin-bottom: 3em;
		z-index: 2;
		position: relative;
		animation: fadeInDown 1s ease-out;
	}

	.title {
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
			'Helvetica Neue', sans-serif;
		font-size: 4em;
		font-weight: 100;
		margin: 0;
		text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		letter-spacing: -2px;
		background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
			'Helvetica Neue', sans-serif;
		font-size: 1.1em;
		margin: 1em 0 0 0;
		opacity: 0.85;
		font-weight: 400;
		letter-spacing: 0.5px;
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	}

	.footer {
		margin-top: auto;
		padding: 2em 1em 1.5em;
		text-align: center;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-size: 0.9em;
		color: rgba(255, 255, 255, 0.7);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		transition: all 0.3s ease;
		animation: gentleFloat 3s ease-in-out infinite;
	}

	.footer:hover {
		color: rgba(255, 255, 255, 0.9);
		transform: translateY(-2px);
		animation-play-state: paused;
	}

	.footer:active {
		transform: translateY(0);
	}

	@keyframes gentleFloat {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-4px);
		}
	}

	@keyframes subtleGlow {
		0% {
			opacity: 0.4;
		}
		100% {
			opacity: 0.8;
		}
	}

	@keyframes fadeInDown {
		from {
			opacity: 0;
			transform: translateY(-30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.content {
			padding: 2.2em 1.4em 1.6em;
		}

		.title {
			font-size: 2.8em;
			letter-spacing: -1px;
		}

		.subtitle {
			font-size: 1em;
			letter-spacing: 0.3px;
		}

		.header {
			margin-bottom: 2em;
		}

		.footer {
			padding: 1.5em 1em 1em;
			font-size: 0.85em;
		}
	}

	@media (max-width: 480px) {
		.content {
			padding: 1.6em 1em 1.2em;
		}

		.title {
			font-size: 2.2em;
		}
	}
</style>
