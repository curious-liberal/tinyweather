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
		description: 'Real-time, cat-based weather check in the style of the show',
		prompt: `
	Speak like the podcast: slow, casual, reacting live while looking around. Present tense only. No imagination, no invented items, no metaphors, no descriptions that sound written. Short lines and small pauses (“yeah…”, “right…”, “okay…”). George gives the temperature through one tiny action he is doing right now (ear move, blink, little head turn). Use only “less than warm” or “not warm.” No numbers and no predictions. Tree of Truth only for wind: “low wind”, “bit windy”, “significant wind”, or “moving a fair bit.” Sky kept simple: “grey”, “bit grey”, “grey with some white bits”, “blue-ish”, “mottled.” At most one optional extra if it is extremely ordinary and happening right now (a seagull sitting, neighbour’s window glint, a bag drifting). Speak loosely in fragments. No tidy sentences. End with a small uncertain verdict (“yeah… we’ll call it grey-ish”) then “There you go, that’s the weather.”

	Follow the style shown in these examples:

	EXAMPLE 1:
	Right… weather.
	George is doing a tiny ear move there… yeah, so, less than warm.
	Tree of Truth’s just… moving a bit. Not loads.
	Sky’s kind of grey… bit of white in it.
	Yeah… we’ll call it grey-ish.
	There you go, that’s the weather.

	EXAMPLE 2:
	Okay… weather time.
	George is looking down… so that’s a not warm.
	Tree of Truth… low wind, pretty still.
	Sky’s… yeah… just grey.
	We’ll go with grey-ish.
	There you go, that’s the weather.

	EXAMPLE 3:
	Right then… weather.
	George blinked… that’s less than warm.
	Tree of Truth’s got a bit of movement… just a bit.
	Sky’s blue-ish… little bit of cloud.
	Yeah… blue-ish.
	There you go, that’s the weather.

	EXAMPLE 4:
	Time for the weather.
	George is doing the slow head turn… so, not warm.
	Tree of Truth… hardly moving, low wind.
	Sky’s… mmm… kind of grey with some white bits.
	Yeah… grey with white bits.
	There you go, that’s the weather.

	EXAMPLE 5:
	Weather.
	George is fully asleep but, yeah, that’s still less than warm.
	Tree of Truth’s moving a fair bit actually…
	Sky’s just… grey.
	We’ll say grey-ish.
	There you go, that’s the weather.

	Rare optional extras (use sparingly):

	EXAMPLE 6:
	Right… weather.
	George is giving a tiny blink… less than warm.
	Tree of Truth… bit windy.
	There’s a seagull just sitting on the roof.
	Sky’s grey-ish blue… yeah… we’ll say grey-blue.
	There you go, that’s the weather.

	EXAMPLE 7:
	Okay… weather.
	George is doing a small ear twitch… not warm.
	Tree of Truth’s moving a fair bit…
	Oh—bag drifting across the garden there.
	Sky’s grey… bit of white.
	Yeah… grey-ish.
	There you go, that’s the weather.
	`,
		emoji: '🐈‍⬛'
	},
	{
		id: 'cute',
		name: 'Cute',
		description: 'Sweet & whimsical',
		prompt:
			'adorable and sweet weather report with charming nature imagery like birds chirping, butterflies dancing, puddle jumping, sunset watching. Be whimsical and positive with cute metaphors and delightful activities',
		emoji: '🦋'
	}
];

// localStorage key for tone preference
const TONE_STORAGE_KEY = 'tinyweather-tone-preference';

// Turn a value into a URL-friendly slug, e.g. "Comedic" -> "comedic".
function slugify(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

// Resolve a URL hash slug to a tone index, matching either its id or name
// (e.g. "#comedic", "#inpc", "#professional"). Returns -1 if no match.
function findToneIndexBySlug(slug: string): number {
	const normalized = slugify(slug);
	if (!normalized) return -1;
	return tones.findIndex(
		(tone) => slugify(tone.id) === normalized || slugify(tone.name) === normalized
	);
}

// Reflect the current tone in the URL hash so the link is always shareable.
// replaceState avoids scroll jumps and history spam on every tone switch.
function updateUrlHash(index: number): void {
	if (!browser) return;

	const tone = tones[index];
	if (!tone) return;

	try {
		history.replaceState(history.state, '', `#${slugify(tone.name)}`);
	} catch (error) {
		console.warn('Failed to update tone in URL:', error);
	}
}

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

// A shared link (e.g. #comedic, #inpc) takes priority over saved preference.
function loadInitialToneIndex(): number {
	if (browser) {
		const hashIndex = findToneIndexBySlug(window.location.hash.replace(/^#/, ''));
		if (hashIndex >= 0) return hashIndex;
	}
	return loadSavedToneIndex();
}

// Initialize store, preferring a shared hash link over the saved preference
const initialToneIndex = loadInitialToneIndex();
export const currentToneIndex = writable(initialToneIndex);
export const isTransitioning = writable(false);

// Persist changes to localStorage and keep the URL hash in sync for sharing
if (browser) {
	currentToneIndex.subscribe((index) => {
		saveToneIndex(index);
		updateUrlHash(index);
	});

	// Allow pasting/visiting a different #tone link to switch the active tone
	window.addEventListener('hashchange', () => {
		const index = findToneIndexBySlug(window.location.hash.replace(/^#/, ''));
		if (index >= 0) currentToneIndex.set(index);
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
