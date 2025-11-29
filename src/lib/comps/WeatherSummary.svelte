<script lang="ts">
	interface Props {
		isLoading: boolean;
		summary: string;
	}

	const { isLoading, summary }: Props = $props();
</script>

<div class="summary">
	{#if isLoading}
		<div class="loading-container">
			<div class="loading-circle"></div>
			<p class="loading-text">Getting weather data...</p>
		</div>
	{:else if summary}
		<h1 class="weather-summary">{summary}</h1>
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

	.loading-circle {
		width: 40px;
		height: 40px;
		border: 3px solid #f0f0f0;
		border-top: 3px solid #909090;
		border-radius: 50%;
		animation: pulse-spin 1.5s ease-in-out infinite;
	}

	.loading-text {
		color: #666;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		font-size: 1em;
		margin: 0;
	}

	.weather-summary {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		font-size: 1.4em;
		line-height: 1.5;
		color: #2d3748;
		max-width: 600px;
		margin: 0 auto;
		padding: 2em;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border-radius: 2em;
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		animation: fade-in-up 0.8s ease-out;
		font-weight: 400;
	}

	@keyframes pulse-spin {
		0% {
			transform: rotate(0deg) scale(1);
			opacity: 1;
		}
		50% {
			transform: rotate(180deg) scale(1.1);
			opacity: 0.7;
		}
		100% {
			transform: rotate(360deg) scale(1);
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