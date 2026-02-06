import type { ProcessedWeatherData } from '$lib/types/weather';
import { PUBLIC_API_KEY } from '$env/static/public';
import type { Tone } from '$lib/stores/toneStore';

interface AIServiceOptions {
	model?: string;
	temperature?: number;
	max_tokens?: number;
}

export async function interpretWeather(
	weatherData: ProcessedWeatherData,
	tone: Tone,
	options: AIServiceOptions = {}
): Promise<string> {
	const { model = 'openai/gpt-oss-120b:free', temperature = 0.7, max_tokens = 2048 } = options;

	const endpoint = 'https://openrouter.ai/api/v1/chat/completions';

	const prompt = `
Here is weather data in JSON:
${JSON.stringify(weatherData)}

You are a weather reporter with the tone of ${tone.name}: ${tone.prompt}.
Be clear, human-readable, and concise. Do not include thinking tags, only weather data, keep everything concise – 3 sentences max.
`;

	const body = {
		max_tokens,
		messages: [{ role: 'user', content: prompt }],
		model,
		temperature,
		stream: false
	};

	const response = await fetch(endpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${PUBLIC_API_KEY}`
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		throw new Error(`API request to AI model failed: ${response.status} ${response.statusText}`);
	}

	const json = await response.json();

	// Remove <think>...</think> blocks if present (with any variations)
	const rawText = json.output_text || json.choices?.[0]?.message?.content || '';
	const weatherSummary = rawText
		.replace(/<think>[\s\S]*?<\/think>/gi, '')
		.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
		.replace(/\[think\][\s\S]*?\[\/think\]/gi, '')
		.replace(/\[thinking\][\s\S]*?\[\/thinking\]/gi, '')
		.trim();

	return weatherSummary;
}
