import type { ProcessedWeatherData } from '$lib/types/weather';

export interface FollowUpSuggestion {
	id: string;
	text: string;
	prompt: string;
	emoji: string;
}

export function generateFollowUpSuggestions(
	weatherData: ProcessedWeatherData,
	location: string
): FollowUpSuggestion[] {
	const suggestions: FollowUpSuggestion[] = [];
	const { precipitation, wind, temperature, clouds } = weatherData;

	// Weather-specific suggestions
	if (precipitation.maxChance > 40) {
		suggestions.push({
			id: 'umbrella',
			text: 'Do I need an umbrella?',
			prompt: `Based on the weather in ${location}, should I bring an umbrella today? Give practical advice about rain likelihood and timing.`,
			emoji: '☂️'
		});
	}

	if (temperature.high > 25 || temperature.low < 5) {
		suggestions.push({
			id: 'clothing',
			text: 'What should I wear?',
			prompt: `Given the temperature range of ${temperature.low}°C to ${temperature.high}°C in ${location}, what clothing would you recommend for today?`,
			emoji: '👕'
		});
	}

	if (wind.max > 15) {
		suggestions.push({
			id: 'outdoor',
			text: 'Good for outdoor activities?',
			prompt: `With wind speeds up to ${wind.max} km/h in ${location}, is it suitable for outdoor activities like cycling, running, or picnics?`,
			emoji: '🚴'
		});
	}

	// Always include these common suggestions
	if (suggestions.length < 3) {
		const commonSuggestions = [
			{
				id: 'tomorrow',
				text: 'What about tomorrow?',
				prompt: `Can you tell me what the weather might be like tomorrow in ${location}? Any significant changes expected?`,
				emoji: '📅'
			},
			{
				id: 'activities',
				text: 'Best time for activities?',
				prompt: `Based on today's weather in ${location}, what's the best time of day for outdoor activities?`,
				emoji: '⏰'
			},
			{
				id: 'comparison',
				text: 'Compare to yesterday?',
				prompt: `How does today's weather in ${location} compare to typical weather for this time of year?`,
				emoji: '📊'
			}
		];

		// Add suggestions that haven't been added yet
		commonSuggestions.forEach((suggestion) => {
			if (!suggestions.find((s) => s.id === suggestion.id) && suggestions.length < 3) {
				suggestions.push(suggestion);
			}
		});
	}

	// Always add the custom question option
	suggestions.push({
		id: 'custom',
		text: 'Something else',
		prompt: '',
		emoji: '💬'
	});

	return suggestions.slice(0, 4); // Maximum 4 suggestions
}

export async function answerFollowUpQuestion(
	question: string,
	weatherData: ProcessedWeatherData,
	location: string
): Promise<string> {
	const endpoint = 'https://api.deepinfra.com/v1/openai/chat/completions';

	const prompt = `
Here is the current weather data for ${location}:
${JSON.stringify(weatherData)}

User question: "${question}"

Please provide a helpful, concise answer (2-3 sentences max) based on the weather data provided. Be practical and actionable in your response.
`;

	const body = {
		max_tokens: 1024,
		messages: [{ role: 'user', content: prompt }],
		model: 'Qwen/Qwen3-32B',
		temperature: 0.7,
		stream: false
	};

	const response = await fetch(endpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		throw new Error(`DeepInfra request failed: ${response.status} ${response.statusText}`);
	}

	const json = await response.json();

	const answer = (json.output_text || json.choices?.[0]?.message?.content || '').replace(
		/<think>[\s\S]*?<\/think>/gi,
		''
	);

	return answer;
}
