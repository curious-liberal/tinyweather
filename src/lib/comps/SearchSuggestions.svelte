<script lang="ts">
	interface Props {
		suggestions: string[];
		onSelect: (index: number) => void;
	}

	const { suggestions, onSelect }: Props = $props();
</script>

<div class="suggestions-wrapper">
	{#each suggestions as suggestion, index}
		<button type="button" onclick={() => onSelect(index)}>{suggestion}</button>
	{/each}
</div>

<style>
	.suggestions-wrapper {
		text-align: center;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		font-size: 1em;
		margin-top: 1em;
		max-width: 500px;
		width: 100%;
	}

	.suggestions-wrapper button {
		animation: fade-in-up 0.6s;
		cursor: pointer;
		padding: 1em;
		margin: 0.3em 0;
		border-radius: 1em;
		transition: all 0.2s ease;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		color: #333;
		font-weight: 500;
		width: 100%;
		font-family: inherit;
		font-size: inherit;
		text-align: left;
	}

	.suggestions-wrapper button:hover {
		background: rgba(255, 255, 255, 1);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	}

	@keyframes fade-in-up {
		0% {
			transform: translateY(3em);
			opacity: 0;
			color: rgb(4, 6, 47);
		}

		100% {
			opacity: 100;
			color: #333;
		}
	}
</style>