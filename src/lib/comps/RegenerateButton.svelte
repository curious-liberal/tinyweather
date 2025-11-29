<script lang="ts">
	interface Props {
		onRegenerate: () => void;
		isLoading: boolean;
	}

	const { onRegenerate, isLoading }: Props = $props();
</script>

<button
	class="regenerate-btn"
	class:loading={isLoading}
	onclick={onRegenerate}
	disabled={isLoading}
	aria-label="Regenerate weather summary"
>
	<svg
		class="refresh-icon"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
	>
		<path d="M21.5 2v6h-6M21.34 12a10 10 0 1 1-2.27-6.33l2.93 2.93" />
	</svg>
	<span class="btn-text">
		{isLoading ? 'Generating...' : 'Regenerate'}
	</span>
</button>

<style>
	.regenerate-btn {
		display: flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.8em 1.2em;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 20px;
		color: white;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-size: 0.9em;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		outline: none;
		margin: 1em auto 0 auto;
		align-self: center;
	}

	.regenerate-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.25);
		transform: translateY(-2px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	}

	.regenerate-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.regenerate-btn:focus-visible {
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
	}

	.regenerate-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.refresh-icon {
		width: 1.2em;
		height: 1.2em;
		transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.regenerate-btn.loading .refresh-icon {
		animation: spin 1s linear infinite;
	}

	.btn-text {
		font-size: 0.95em;
		letter-spacing: 0.3px;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 768px) {
		.regenerate-btn {
			padding: 0.7em 1em;
			font-size: 0.85em;
		}

		.refresh-icon {
			width: 1em;
			height: 1em;
		}
	}
</style>
