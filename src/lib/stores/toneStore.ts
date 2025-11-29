import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Tone {
	id: string;
	name: string;
	description: string;
	prompt: string;
	emoji: string;
}

export const tones: Tone[] = [
	{
		id: 'funny',
		name: 'Comedic',
		description: 'Witty & humorous',
		prompt:
			'hilarious, cheeky weather report with brilliant British-style comparisons like "wind so strong it\'ll blow your eyebrows clean off", "as cold as your mum\'s heart on a dating app", or "as windy as your uncle\'s farts at Christmas". Be playfully rude, use funny analogies about family, relationships, everyday situations. Think pub comedian meets weather presenter',
		emoji: '😄'
	},
	{
		id: 'professional',
		name: 'Professional',
		description: 'Formal & detailed',
		prompt: 'professional: extremely professional, informative and detailed weather reporter',
		emoji: '📊'
	},
	{
		id: 'poetic',
		name: 'Poetic',
		description: 'Artistic & lyrical',
		prompt:
			'poetic and artistic weather report using beautiful metaphors and lyrical language. Think of a poet describing nature',
		emoji: '🎭'
	},
	{
		id: 'dramatic',
		name: 'Dramatic',
		description: 'Epic & theatrical',
		prompt:
			'dramatic and theatrical weather report as if narrating an epic movie scene. Be cinematic and intense',
		emoji: '🎬'
	},
	{
		id: 'chill',
		name: 'Chill',
		description: 'Laid-back & casual',
		prompt:
			'super chill and laid-back weather report like a surfer or cool friend just hanging out. Use casual language',
		emoji: '😎'
	},
	{
		id: 'scientific',
		name: 'Scientific',
		description: 'Technical & analytical',
		prompt:
			'highly scientific and technical weather analysis with meteorological terminology and data-driven insights',
		emoji: '🔬'
	},
	{
		id: 'inpc',
		name: 'INPC',
		description: 'Cat-based weather reading',
		prompt:
			'weather report in the style of the show: short, observational, slightly amused. Start with a simple intro (“Time for the weather”, “Right then, weather”, etc.). George the cat gives the temperature with one tiny action (a blink, head turn, ear twitch, nose move). Use simple terms like “less than warm”, “not warm”. Tree of Truth only for wind levels (“low wind”, “bit windy”, “significant wind”, “verging on moderate”). Include at most one small optional extra detail (a seagull, neighbour window glint, a drifting bag). Describe the sky simply (“bit grey”, “mottled”, “blue-ish”, “grey with white bits”). End with a quiet sky verdict (“yeah… we’ll go with grey-ish”, “mmm actually a grey-ish blue”). Finish with “There you go, that’s the weather.”. Stay grounded, no surrealism, no rambling.',
		emoji: '🐈‍⬛'
	},
	{
		id: 'cute',
		name: 'Cute',
		description: 'Sweet & whimsical',
		prompt:
			'adorable and sweet weather report with charming nature imagery like birds chirping, butterflies dancing, puddle jumping, sunset watching. Be whimsical and positive with cute metaphors and delightful activities',
		emoji: '🦋'
	},
];

// localStorage key for tone preference
const TONE_STORAGE_KEY = 'tinyweather-tone-preference';

// Load saved tone index from localStorage
function loadSavedToneIndex(): number {
	if (!browser) return 0;

	try {
		const saved = localStorage.getItem(TONE_STORAGE_KEY);
		if (saved !== null) {
			const index = parseInt(saved, 10);
			// Validate the index is within bounds
			if (index >= 0 && index < tones.length) {
				return index;
			}
		}
	} catch (error) {
		console.warn('Failed to load tone preference from localStorage:', error);
	}

	return 0; // Default to first tone
}

// Save tone index to localStorage
function saveToneIndex(index: number): void {
	if (!browser) return;

	try {
		localStorage.setItem(TONE_STORAGE_KEY, index.toString());
	} catch (error) {
		console.warn('Failed to save tone preference to localStorage:', error);
	}
}

// Initialize store with saved preference
const initialToneIndex = loadSavedToneIndex();
export const currentToneIndex = writable(initialToneIndex);
export const isTransitioning = writable(false);

// Subscribe to changes and save to localStorage
if (browser) {
	currentToneIndex.subscribe((index) => {
		saveToneIndex(index);
	});
}

export function nextTone() {
	currentToneIndex.update((index) => (index + 1) % tones.length);
}

export function previousTone() {
	currentToneIndex.update((index) => (index === 0 ? tones.length - 1 : index - 1));
}

export function getCurrentTone(index: number): Tone {
	return tones[index] || tones[0];
}
