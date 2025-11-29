<script lang="ts">
	import { onMount } from 'svelte';
	import {
		currentToneIndex,
		tones,
		getCurrentTone,
		nextTone,
		previousTone
	} from '$lib/stores/toneStore';

	interface Props {
		onToneChange: () => void;
	}

	const { onToneChange }: Props = $props();

	let containerRef: HTMLDivElement;
	let startX = 0;
	let isDragging = $state(false);
	let dragDistance = $state(0);

	// Touch/mouse event handlers for swipe gestures
	const handleStart = (clientX: number) => {
		startX = clientX;
		isDragging = true;
		dragDistance = 0;
	};

	const handleMove = (clientX: number) => {
		if (!isDragging) return;
		dragDistance = clientX - startX;
	};

	const handleEnd = () => {
		if (!isDragging) return;

		const threshold = 50; // Minimum swipe distance

		if (Math.abs(dragDistance) > threshold) {
			if (dragDistance > 0) {
				previousTone();
			} else {
				nextTone();
			}
			onToneChange();
		}

		isDragging = false;
		dragDistance = 0;
	};

	// Touch events
	const handleTouchStart = (e: TouchEvent) => {
		handleStart(e.touches[0].clientX);
	};

	const handleTouchMove = (e: TouchEvent) => {
		handleMove(e.touches[0].clientX);
	};

	const handleTouchEnd = () => {
		handleEnd();
	};

	// Mouse events
	const handleMouseDown = (e: MouseEvent) => {
		handleStart(e.clientX);
	};

	const handleMouseMove = (e: MouseEvent) => {
		handleMove(e.clientX);
	};

	const handleMouseUp = () => {
		handleEnd();
	};

	const handleKeyboard = (e: KeyboardEvent) => {
		if (e.key === 'ArrowLeft') {
			previousTone();
			onToneChange();
		} else if (e.key === 'ArrowRight') {
			nextTone();
			onToneChange();
		}
	};

	onMount(() => {
		if (containerRef) {
			// Mouse events
			containerRef.addEventListener('mousedown', handleMouseDown);
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);

			// Touch events
			containerRef.addEventListener('touchstart', handleTouchStart, { passive: true });
			containerRef.addEventListener('touchmove', handleTouchMove, { passive: true });
			containerRef.addEventListener('touchend', handleTouchEnd);

			// Keyboard events
			containerRef.addEventListener('keydown', handleKeyboard);

			return () => {
				containerRef?.removeEventListener('mousedown', handleMouseDown);
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
				containerRef?.removeEventListener('touchstart', handleTouchStart);
				containerRef?.removeEventListener('touchmove', handleTouchMove);
				containerRef?.removeEventListener('touchend', handleTouchEnd);
				containerRef?.removeEventListener('keydown', handleKeyboard);
			};
		}
	});
</script>

<div
	bind:this={containerRef}
	class="tone-switcher"
	class:dragging={isDragging}
	style="--drag-distance: {dragDistance}px"
	tabindex="0"
	role="button"
	aria-label="Swipe to change tone"
>
	<div class="tone-indicator">
		<div class="tone-dots">
			{#each tones as tone, index}
				<button
					type="button"
					class="dot"
					class:active={index === $currentToneIndex}
					onclick={() => {
						currentToneIndex.set(index);
						onToneChange();
					}}
					aria-label="Switch to {tone.name} tone"
				></button>
			{/each}
		</div>

		<div class="current-tone">
			<div class="tone-emoji">{getCurrentTone($currentToneIndex).emoji}</div>
			<div class="tone-info">
				<div class="tone-name">{getCurrentTone($currentToneIndex).name}</div>
				<div class="tone-description">{getCurrentTone($currentToneIndex).description}</div>
			</div>
		</div>

		<div class="swipe-hint">
			<button
				type="button"
				class="arrow left"
				onclick={() => {
					previousTone();
					onToneChange();
				}}
				aria-label="Previous tone">←</button
			>
			<span class="hint-text">Swipe to change tone</span>
			<button
				type="button"
				class="arrow right"
				onclick={() => {
					nextTone();
					onToneChange();
				}}
				aria-label="Next tone">→</button
			>
		</div>
	</div>
</div>

<style>
	.tone-switcher {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 24px;
		padding: 1.5em;
		margin: 1.5em 0;
		cursor: grab;
		user-select: none;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		transform: translateX(calc(var(--drag-distance) * 0.1));
		outline: none;
	}

	.tone-switcher:hover {
		background: rgba(255, 255, 255, 0.15);
		transform: translateY(-2px) translateX(calc(var(--drag-distance) * 0.1));
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
	}

	.tone-switcher.dragging {
		cursor: grabbing;
		transition: none;
	}

	.tone-switcher:focus-visible {
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
	}

	.tone-indicator {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1em;
	}

	.tone-dots {
		display: flex;
		gap: 0.5em;
		margin-bottom: 0.5em;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.3);
		cursor: pointer;
		transition: all 0.3s ease;
		border: none;
		padding: 0;
		font-size: 0;
		outline: none;
	}

	.dot.active {
		background: white;
		transform: scale(1.2);
		box-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
	}

	.dot:hover {
		background: rgba(255, 255, 255, 0.6);
		transform: scale(1.1);
	}

	.dot:focus-visible {
		outline: 2px solid white;
		outline-offset: 2px;
	}

	.current-tone {
		display: flex;
		align-items: flex-start;
		gap: 1em;
		color: white;
		text-align: left;
		width: 100%;
		max-width: 500px;
		margin: 0 auto;
	}

	.tone-emoji {
		font-size: 2.5em;
		animation: float 3s ease-in-out infinite;
		flex-shrink: 0;
		line-height: 1;
	}

	.tone-info {
		display: flex;
		flex-direction: column;
		gap: 0.3em;
		flex: 1;
		min-width: 0;
		padding-top: 0.1em;
	}

	.tone-name {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-size: 1.2em;
		font-weight: 600;
		letter-spacing: 0.5px;
		line-height: 1.3;
	}

	.tone-description {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-size: 0.85em;
		opacity: 0.8;
		font-weight: 400;
		line-height: 1.4;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	.swipe-hint {
		display: flex;
		align-items: center;
		gap: 0.8em;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.8em;
		margin-top: 0.5em;
	}

	.hint-text {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-weight: 400;
	}

	.arrow {
		font-size: 1.2em;
		animation: pulse 2s ease-in-out infinite;
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		padding: 0.5em;
		border-radius: 50%;
		transition: all 0.2s ease;
		outline: none;
	}

	.arrow:hover {
		background: rgba(255, 255, 255, 0.2);
		animation: none;
		transform: scale(1.2);
	}

	.arrow:focus-visible {
		outline: 2px solid rgba(255, 255, 255, 0.5);
		outline-offset: 2px;
	}

	.arrow:active {
		transform: scale(1.1);
	}

	.arrow.left {
		animation-delay: 0s;
	}

	.arrow.right {
		animation-delay: 1s;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-5px);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.7;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.1);
		}
	}

	@media (max-width: 768px) {
		.tone-switcher {
			padding: 1.2em;
			margin: 1em 0;
		}

		.tone-emoji {
			font-size: 2em;
		}

		.current-tone {
			flex-direction: column;
			text-align: center;
			gap: 0.5em;
			align-items: center;
		}

		.tone-info {
			text-align: center;
			padding-top: 0;
		}

		.tone-description {
			font-size: 0.8em;
		}
	}
</style>
