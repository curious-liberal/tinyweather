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
			followUpAnswer = 'Sorry, I couldn\'t get an answer right now.';
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
			followUpAnswer = 'Sorry, I couldn\'t get an answer right now.';
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
			{#each suggestions as suggestion, index}
				<button
					class="suggestion-tag"
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
					<button onclick={() => { showCustomInput = false; customQuestion = ''; }} class="cancel-btn">
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
	}

	.suggestions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.8em;
		margin-bottom: 1em;
	}

	.suggestion-tag {
		display: flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.8em 1em;
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
	}

	.suggestion-tag:hover {
		background: rgba(255, 255, 255, 0.25);
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	}

	.emoji {
		font-size: 1.2em;
	}

	.text {
		flex: 1;
		text-align: left;
	}

	.custom-input-container {
		margin-bottom: 1em;
		animation: fadeInUp 0.4s ease-out;
	}

	.custom-input-wrapper {
		background: linear-gradient(135deg,
			rgba(255, 255, 255, 0.2) 0%,
			rgba(255, 255, 255, 0.15) 50%,
			rgba(255, 255, 255, 0.1) 100%);
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
		justify-content: flex-end;
	}

	.submit-btn, .cancel-btn {
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
		animation: slideInAnswer 0.5s ease-out;
	}

	.answer-content {
		background: linear-gradient(135deg,
			rgba(255, 255, 255, 0.2) 0%,
			rgba(255, 255, 255, 0.15) 50%,
			rgba(255, 255, 255, 0.1) 100%);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border-radius: 20px;
		padding: 1.5em;
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
		font-size: 1.1em;
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

	.dot:nth-child(2) { animation-delay: 0.2s; }
	.dot:nth-child(3) { animation-delay: 0.4s; }

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
			transform: translateY(20px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes dotPulse {
		0%, 80%, 100% {
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
			grid-template-columns: 1fr;
		}

		.suggestion-tag {
			justify-content: center;
		}
	}
</style>