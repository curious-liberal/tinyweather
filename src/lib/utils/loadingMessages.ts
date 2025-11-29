import type { Tone } from '$lib/stores/toneStore';

export interface LoadingMessage {
	weather: string[];
	response: string[];
}

export const toneLoadingMessages: Record<string, LoadingMessage> = {
	funny: {
		weather: [
			"Fetching the forecast...",
			"Checking if it's raining cats and dogs...",
			"Consulting the weather gods...",
			"Reading the clouds..."
		],
		response: [
			"Crafting comedic commentary...",
			"Brewing up some weather wit...",
			"Adding a dash of humor...",
			"Cooking up some weather laughs...",
			"Spicing up the forecast..."
		]
	},

	professional: {
		weather: [
			"Retrieving meteorological data...",
			"Accessing weather systems...",
			"Processing atmospheric conditions...",
			"Gathering forecast information..."
		],
		response: [
			"Analyzing atmospheric patterns...",
			"Compiling professional forecast...",
			"Processing meteorological data...",
			"Generating detailed report...",
			"Synthesizing weather intelligence..."
		]
	},

	poetic: {
		weather: [
			"Listening to nature's whispers...",
			"Reading the sky's poetry...",
			"Gathering celestial verses...",
			"Collecting atmospheric melodies..."
		],
		response: [
			"Weaving weather poetry...",
			"Composing atmospheric verses...",
			"Painting with meteorological words...",
			"Crafting lyrical forecasts...",
			"Orchestrating weather sonnets..."
		]
	},

	dramatic: {
		weather: [
			"Summoning the elements...",
			"Channeling atmospheric forces...",
			"Awakening weather spirits...",
			"Commanding the skies..."
		],
		response: [
			"Unleashing epic weather drama...",
			"Choreographing atmospheric theater...",
			"Scripting meteorological mayhem...",
			"Directing the weather story...",
			"Orchestrating climatic crescendo..."
		]
	},

	chill: {
		weather: [
			"Vibing with the atmosphere...",
			"Chilling with the clouds...",
			"Cruising through the forecast...",
			"Hanging with the weather..."
		],
		response: [
			"Keeping it cool and casual...",
			"Chilling out the forecast...",
			"Laying back with the weather...",
			"Cruising through the vibes...",
			"Just hanging with the atmosphere..."
		]
	},

	scientific: {
		weather: [
			"Calibrating atmospheric sensors...",
			"Processing meteorological variables...",
			"Analyzing pressure differentials...",
			"Computing atmospheric dynamics..."
		],
		response: [
			"Calculating meteorological probabilities...",
			"Processing atmospheric algorithms...",
			"Synthesizing climatological data...",
			"Computing weather correlations...",
			"Analyzing precipitation matrices..."
		]
	},

	cute: {
		weather: [
			"Asking the little birdies...",
			"Checking with the butterflies...",
			"Peeking through the clouds...",
			"Listening to nature's whispers..."
		],
		response: [
			"Sprinkling weather magic...",
			"Gathering sunshine and raindrops...",
			"Dancing with the weather spirits...",
			"Creating your cozy forecast...",
			"Painting a weather picture..."
		]
	}
};

// Default messages for unknown tones
const defaultMessages: LoadingMessage = {
	weather: [
		"Fetching weather data...",
		"Getting forecast information...",
		"Checking atmospheric conditions...",
		"Retrieving climate data..."
	],
	response: [
		"Generating weather summary...",
		"Processing forecast details...",
		"Crafting your weather report...",
		"Preparing atmospheric insights..."
	]
};

export function getRandomLoadingMessage(tone: Tone, type: 'weather' | 'response'): string {
	const messages = toneLoadingMessages[tone.id] || defaultMessages;
	const messageArray = messages[type];
	return messageArray[Math.floor(Math.random() * messageArray.length)];
}

// Get a cycling message that changes every few seconds
export function getCyclingMessage(tone: Tone, type: 'weather' | 'response', duration: number = 2000): () => string {
	const messages = toneLoadingMessages[tone.id] || defaultMessages;
	const messageArray = messages[type];
	let currentIndex = 0;

	return () => {
		const message = messageArray[currentIndex];
		currentIndex = (currentIndex + 1) % messageArray.length;
		return message;
	};
}