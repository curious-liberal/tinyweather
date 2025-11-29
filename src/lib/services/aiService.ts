import type { ProcessedWeatherData } from "$lib/types/weather";

const tones: Record<string, string> = {
	"funny": "funny, witty weather report that includes some funny naughty innuendos. Imagine a comedian presenting the weather",
	"professional": "professional: extremely professional, informative and detailed weather reporter",
};

interface AIServiceOptions {
	model?: string;
	temperature?: number;
	max_tokens?: number;
}

export async function interpretWeather(
	weatherData: ProcessedWeatherData,
	tone: string = "funny",
	options: AIServiceOptions = {}
): Promise<string> {
	const {
		model = "Qwen/Qwen3-32B",
		temperature = 0.7,
		max_tokens = 2048
	} = options;

	const endpoint = "https://api.deepinfra.com/v1/openai/chat/completions";

	const prompt = `
Here is weather data in JSON:
${JSON.stringify(weatherData)}

You are a weather reporter with the tone of ${tone}: ${tones[tone]}.
Be clear, human-readable, and concise. Do not include thinking tags, only weather data, keep everything concise – 3 sentences max.
`;

	const body = {
		max_tokens,
		messages: [
			{ role: "user", content: prompt }
		],
		model,
		temperature,
		stream: false
	};

	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		throw new Error(`DeepInfra request failed: ${response.status} ${response.statusText}`);
	}

	const json = await response.json();

	// Remove <think>...</think> blocks if present
	const weatherSummary = (
		json.output_text ||
		json.choices?.[0]?.message?.content ||
		""
	).replace(/<think>[\s\S]*?<\/think>/gi, "");

	return weatherSummary;
}