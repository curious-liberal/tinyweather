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
		padding: 1em 1.2em;
		margin: 0.3em 0;
		border-radius: 1.2em;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		background: linear-gradient(135deg,
			rgba(255, 255, 255, 0.2) 0%,
			rgba(255, 255, 255, 0.15) 50%,
			rgba(255, 255, 255, 0.1) 100%);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border: none;
		box-shadow:
			0 4px 16px rgba(0, 0, 0, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.25),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1);
		color: white;
		font-weight: 500;
		width: 100%;
		font-family: inherit;
		font-size: inherit;
		text-align: left;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
		letter-spacing: 0.2px;
	}

	.suggestions-wrapper button:hover {
		background: linear-gradient(135deg,
			rgba(255, 255, 255, 0.3) 0%,
			rgba(255, 255, 255, 0.25) 50%,
			rgba(255, 255, 255, 0.2) 100%);
		transform: translateY(-3px) scale(1.02);
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.35),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1);
	}

	.suggestions-wrapper button:active {
		transform: translateY(-1px) scale(1.01);
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