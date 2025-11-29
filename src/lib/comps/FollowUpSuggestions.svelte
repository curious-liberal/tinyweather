<script lang="ts">
	import type { FollowUpSuggestion, ProcessedWeatherData } from '$lib/types/weather';
	import { answerFollowUpQuestion } from '$lib/services/followUpService';
	import { parseMarkdown } from '$lib/utils/markdown';

	interface Props {
		suggestions: FollowUpSuggestion[];
		weatherData: ProcessedWeatherData | null;
		location: string;
		onCustomQuestion: (question: string) => void;
	}

	const { suggestions, weatherData, location, onCustomQuestion }: Props = $props();

	// Sort suggestions to put "Something else" (custom) at the end
	const displaySuggestions = $derived(
		[...suggestions].sort((a, b) => (a.id === 'custom' ? 1 : b.id === 'custom' ? -1 : 0))
	);

	let showCustomInput = $state(false);
	let customQuestion = $state('');
	let isAnswering = $state(false);
	let followUpAnswer = $state('');

	let formattedAnswer = $derived(followUpAnswer ? parseMarkdown(followUpAnswer) : '');

	const handleSuggestionClick = async (suggestion: FollowUpSuggestion) => {
		if (suggestion.id === 'custom') {
			showCustomInput = true;
			return;
		}

		if (!weatherData) return;

		isAnswering = true;
		followUpAnswer = '';

		try {
			const answer = await answerFollowUpQuestion(suggestion.prompt, weatherData, location);
			followUpAnswer = answer;
		} catch (error) {
			console.error('Error getting follow-up answer:', error);
			followUpAnswer = "Sorry, I couldn't get an answer right now.";
		} finally {
			isAnswering = false;
		}
	};

	const handleCustomSubmit = async () => {
		if (!customQuestion.trim() || !weatherData) return;

		const customPrompt = `About the weather in ${location}: ${customQuestion}`;
		isAnswering = true;
		showCustomInput = false;

		try {
			const answer = await answerFollowUpQuestion(customPrompt, weatherData, location);
			followUpAnswer = answer;
		} catch (error) {
			console.error('Error getting custom answer:', error);
			followUpAnswer = "Sorry, I couldn't get an answer right now.";
		} finally {
			isAnswering = false;
		}

		customQuestion = '';
	};

	const closeAnswer = () => {
		followUpAnswer = '';
	};
</script>

<div class="follow-up-container">
	{#if suggestions.length > 0}
		<div class="suggestions-grid">
			{#each displaySuggestions as suggestion, index}
				<button
					class="suggestion-tag"
					class:custom={suggestion.id === 'custom'}
					class:mobile-hidden={index > 2}
					onclick={() => handleSuggestionClick(suggestion)}
					style="animation-delay: {index * 150}ms"
				>
					<span class="emoji">{suggestion.emoji}</span>
					<span class="text">{suggestion.text}</span>
				</button>
			{/each}
		</div>
	{/if}

	{#if showCustomInput}
		<div class="custom-input-container">
			<div class="custom-input-wrapper">
				<input
					bind:value={customQuestion}
					placeholder="Ask about the weather..."
					class="custom-input"
					onkeydown={(e) => e.key === 'Enter' && handleCustomSubmit()}
				/>
				<div class="input-actions">
					<button onclick={handleCustomSubmit} class="submit-btn" disabled={!customQuestion.trim()}>
						Ask
					</button>
					<button
						onclick={() => {
							showCustomInput = false;
							customQuestion = '';
						}}
						class="cancel-btn"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if isAnswering}
		<div class="answer-container">
			<div class="loading-dots">
				<div class="dot"></div>
				<div class="dot"></div>
				<div class="dot"></div>
			</div>
		</div>
	{:else if followUpAnswer}
		<div class="answer-container">
			<div class="answer-content">
				<div class="answer-text">{@html formattedAnswer}</div>
				<button onclick={closeAnswer} class="close-answer">×</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.follow-up-container {
		margin-top: 2em;
		width: 100%;
		max-width: 600px;
		padding: 0 0.5em;
		scroll-margin-top: 80px;
	}

	.suggestions-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 0.8em;
		margin-bottom: 1em;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.suggestion-tag {
		display: flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.75em 0.95em;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 20px;
		color: white;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-size: 0.9em;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		animation: bubbleGrow 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
		opacity: 0;
		transform: scale(0);
		text-align: left;
		justify-content: flex-start;
	}

	/* Desktop: Top 3 items each span 2 columns (filling 6 columns) */
	.suggestion-tag:nth-child(1) {
		grid-column: 1 / 3;
	}

	.suggestion-tag:nth-child(2) {
		grid-column: 3 / 5;
	}

	.suggestion-tag:nth-child(3) {
		grid-column: 5 / 7;
	}

	/* Desktop: Bottom 2 items centered as a group */
	.suggestion-tag:nth-child(4) {
		grid-column: 2 / 4;
	}

	.suggestion-tag:nth-child(5) {
		grid-column: 4 / 6;
	}

	.suggestion-tag:hover {
		background: rgba(255, 255, 255, 0.25);
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	}

	.emoji {
		font-size: 1.2em;
		flex-shrink: 0;
	}

	.text {
		flex: 1;
		text-align: left;
		line-height: 1.3;
	}

	.custom-input-container {
		margin-bottom: 1em;
		animation: fadeInUp 0.4s ease-out;
		scroll-margin-top: 120px;
	}

	.custom-input-wrapper {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.2) 0%,
			rgba(255, 255, 255, 0.15) 50%,
			rgba(255, 255, 255, 0.1) 100%
		);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border-radius: 20px;
		padding: 1.2em;
		border: none;
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.25),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1);
	}

	.custom-input {
		width: 100%;
		border: none;
		background: transparent;
		padding: 0.5em 0;
		font-size: 1em;
		color: white;
		outline: none;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.custom-input::placeholder {
		color: rgba(255, 255, 255, 0.7);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.input-actions {
		display: flex;
		gap: 0.5em;
		margin-top: 0.8em;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.submit-btn,
	.cancel-btn {
		padding: 0.5em 1.2em;
		border-radius: 12px;
		border: none;
		font-family: inherit;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.submit-btn {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%);
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.submit-btn:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.3) 100%);
		border-color: rgba(255, 255, 255, 0.3);
	}

	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.cancel-btn {
		background: rgba(255, 255, 255, 0.15);
		color: rgba(255, 255, 255, 0.8);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.cancel-btn:hover {
		background: rgba(255, 255, 255, 0.25);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.answer-container {
		margin-top: 0.5em;
		animation: slideInAnswer 0.5s ease-out;
	}

	.answer-content {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.2) 0%,
			rgba(255, 255, 255, 0.15) 50%,
			rgba(255, 255, 255, 0.1) 100%
		);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border-radius: 20px;
		padding: 1.2em;
		border: none;
		position: relative;
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.25),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1);
	}

	.answer-text {
		color: white;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		line-height: 1.5;
		margin: 0;
		font-size: 1.05em;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.close-answer {
		position: absolute;
		top: 0.5em;
		right: 0.8em;
		background: none;
		border: none;
		font-size: 1.5em;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		line-height: 1;
		transition: color 0.2s ease;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.close-answer:hover {
		color: white;
	}

	.loading-dots {
		display: flex;
		justify-content: center;
		padding: 2em;
		gap: 0.5em;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.7);
		animation: dotPulse 1.4s ease-in-out infinite both;
	}

	.dot:nth-child(2) {
		animation-delay: 0.2s;
	}
	.dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes bubbleGrow {
		0% {
			opacity: 0;
			transform: scale(0);
		}
		70% {
			opacity: 1;
			transform: scale(1.1);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideInAnswer {
		from {
			opacity: 0;
			transform: translateY(10px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes dotPulse {
		0%,
		80%,
		100% {
			transform: scale(0.8);
			opacity: 0.5;
		}
		40% {
			transform: scale(1.2);
			opacity: 1;
		}
	}

	@media (max-width: 768px) {
		.suggestions-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 0.65em;
		}

		/* Hide suggestions 4 and 5 on mobile (show only 3 total) */
		.suggestion-tag.mobile-hidden {
			display: none;
		}

		/* Mobile: 2 on top row, "Something else" centered on bottom row spanning both columns */
		.suggestion-tag:nth-child(3) {
			grid-column: 1 / 3;
			justify-self: center;
			max-width: 280px;
		}

		/* Reset desktop positioning */
		.suggestion-tag:nth-child(4),
		.suggestion-tag:nth-child(5) {
			grid-column: auto;
		}

		.follow-up-container {
			margin-top: 1.25em;
			padding: 0 0.25em;
		}

		.custom-input-wrapper {
			padding: 0.9em;
		}

		.submit-btn,
		.cancel-btn {
			padding: 0.45em 0.9em;
			border-radius: 10px;
		}

		.answer-content {
			padding: 1em;
			border-radius: 16px;
		}

		.answer-text {
			font-size: 0.95em;
		}

		.close-answer {
			top: 0.3em;
			right: 0.5em;
			font-size: 1.2em;
		}
	}
</style>
