<script lang="ts">
	import { onMount } from 'svelte';
	import { parseMarkdown } from '$lib/utils/markdown';
	import { getRandomLoadingMessage } from '$lib/utils/loadingMessages';
	import { getCurrentTone } from '$lib/stores/toneStore';
	import type { Tone } from '$lib/stores/toneStore';

	interface Props {
		isLoading: boolean;
		summary: string;
		loadingType?: 'weather' | 'response';
		currentToneIndex?: number;
	}

	const { isLoading, summary, loadingType = 'weather', currentToneIndex = 0 }: Props = $props();

	let formattedSummary = $derived(summary ? parseMarkdown(summary) : '');
	let loadingMessage = $state('Loading...');
	let messageInterval: ReturnType<typeof setInterval> | null = null;

	// Update loading message when loading starts
	$effect(() => {
		if (isLoading) {
			const tone = getCurrentTone(currentToneIndex);
			const messages: string[] = [];

			// Get multiple messages for cycling
			for (let i = 0; i < 4; i++) {
				messages.push(getRandomLoadingMessage(tone, loadingType));
			}

			let messageIndex = 0;
			loadingMessage = messages[messageIndex];

			// Cycle through messages every 4 seconds
			messageInterval = setInterval(() => {
				messageIndex = (messageIndex + 1) % messages.length;
				loadingMessage = messages[messageIndex];
			}, 4000);
		} else {
			if (messageInterval) {
				clearInterval(messageInterval);
				messageInterval = null;
			}
		}
	});

	// Cleanup on unmount
	onMount(() => {
		return () => {
			if (messageInterval) {
				clearInterval(messageInterval);
			}
		};
	});
</script>

<div class="summary">
	{#if isLoading}
		<div class="loading-container">
			<div class="loading-pulse"></div>
			<p class="loading-text">{loadingMessage}</p>
		</div>
	{:else if summary}
		<h1 class="weather-summary">{@html formattedSummary}</h1>
	{/if}
</div>

<style>
	.summary {
		margin-top: 2em;
		text-align: center;
		min-height: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1em;
	}

	.loading-pulse {
		width: 60px;
		height: 60px;
		background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 70%, transparent 100%);
		border-radius: 50%;
		animation: gentlePulse 2s ease-in-out infinite;
		position: relative;
	}

	.loading-pulse::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 20px;
		height: 20px;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 50%;
		animation: innerPulse 2s ease-in-out infinite;
	}

	.loading-text {
		color: rgba(255, 255, 255, 0.9);
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		font-size: 1.1em;
		margin: 0;
		font-weight: 500;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		animation: textPulse 2s ease-in-out infinite;
	}

	.weather-summary {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		font-size: 1.6em;
		line-height: 1.6;
		color: white;
		max-width: 600px;
		margin: 0 auto;
		padding: 2em;
		background: none;
		animation: fade-in-up 0.8s ease-out;
		font-weight: 400;
		text-align: center;
		text-shadow:
			0 2px 8px rgba(0, 0, 0, 0.3),
			0 4px 16px rgba(0, 0, 0, 0.2),
			0 1px 0 rgba(0, 0, 0, 0.4);
		letter-spacing: 0.3px;
	}

	.weather-summary :global(strong) {
		font-weight: 600;
		text-shadow:
			0 2px 8px rgba(0, 0, 0, 0.4),
			0 4px 16px rgba(0, 0, 0, 0.3),
			0 1px 0 rgba(0, 0, 0, 0.5);
	}

	.weather-summary :global(em) {
		font-style: italic;
		opacity: 0.95;
	}

	@keyframes gentlePulse {
		0%, 100% {
			transform: scale(1);
			opacity: 0.8;
		}
		50% {
			transform: scale(1.1);
			opacity: 1;
		}
	}

	@keyframes innerPulse {
		0%, 100% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 1;
		}
		50% {
			transform: translate(-50%, -50%) scale(1.3);
			opacity: 0.7;
		}
	}

	@keyframes textPulse {
		0%, 100% {
			opacity: 0.9;
		}
		50% {
			opacity: 1;
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
			color: #2d3748;
		}
	}
</style>