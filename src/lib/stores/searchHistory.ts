import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface SearchHistoryEntry {
	location: string;
	count: number;
	lastSearched: number;
}

export interface SearchHistory {
	[location: string]: SearchHistoryEntry;
}

const SEARCH_HISTORY_KEY = 'tinyweather-search-history';
const MAX_HISTORY_ENTRIES = 50;
const HISTORY_CLEANUP_DAYS = 30;

// Default placeholder suggestions (fallback)
const DEFAULT_SUGGESTIONS = ["London", "Glasgow", "Birmingham", "Norwich", "Malta"];

// Load search history from localStorage
function loadSearchHistory(): SearchHistory {
	if (!browser) return {};

	try {
		const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			// Validate the structure
			if (typeof parsed === 'object' && parsed !== null) {
				return parsed;
			}
		}
	} catch (error) {
		console.warn('Failed to load search history from localStorage:', error);
	}

	return {};
}

// Save search history to localStorage
function saveSearchHistory(history: SearchHistory): void {
	if (!browser) return;

	try {
		localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
	} catch (error) {
		console.warn('Failed to save search history to localStorage:', error);
	}
}

// Clean up old entries (older than HISTORY_CLEANUP_DAYS)
function cleanupOldEntries(history: SearchHistory): SearchHistory {
	const cutoffDate = Date.now() - (HISTORY_CLEANUP_DAYS * 24 * 60 * 60 * 1000);
	const cleaned: SearchHistory = {};

	Object.entries(history).forEach(([location, entry]) => {
		if (entry.lastSearched > cutoffDate) {
			cleaned[location] = entry;
		}
	});

	return cleaned;
}

// Limit history to MAX_HISTORY_ENTRIES (remove least used)
function limitHistorySize(history: SearchHistory): SearchHistory {
	const entries = Object.entries(history);

	if (entries.length <= MAX_HISTORY_ENTRIES) {
		return history;
	}

	// Sort by usage score (count * recency factor)
	const sorted = entries.sort(([, a], [, b]) => {
		const recencyA = Date.now() - a.lastSearched;
		const recencyB = Date.now() - b.lastSearched;
		const scoreA = a.count / (1 + recencyA / (24 * 60 * 60 * 1000));
		const scoreB = b.count / (1 + recencyB / (24 * 60 * 60 * 1000));
		return scoreB - scoreA;
	});

	// Keep only top entries
	const limited: SearchHistory = {};
	sorted.slice(0, MAX_HISTORY_ENTRIES).forEach(([location, entry]) => {
		limited[location] = entry;
	});

	return limited;
}

// Initialize store
const initialHistory = cleanupOldEntries(loadSearchHistory());
export const searchHistory = writable<SearchHistory>(initialHistory);

// Subscribe to changes and save to localStorage
if (browser) {
	searchHistory.subscribe((history) => {
		saveSearchHistory(history);
	});
}

// Add a search to history
export function logSearch(location: string): void {
	if (!location?.trim()) return;

	const cleanLocation = location.trim();

	searchHistory.update(history => {
		let updated = { ...history };

		if (updated[cleanLocation]) {
			// Increment count and update timestamp
			updated[cleanLocation] = {
				...updated[cleanLocation],
				count: updated[cleanLocation].count + 1,
				lastSearched: Date.now()
			};
		} else {
			// Add new entry
			updated[cleanLocation] = {
				location: cleanLocation,
				count: 1,
				lastSearched: Date.now()
			};
		}

		// Clean up and limit size
		updated = cleanupOldEntries(updated);
		updated = limitHistorySize(updated);

		return updated;
	});
}

// Get popular searches for placeholder suggestions
export function getPopularSearches(limit: number = 5): string[] {
	let currentHistory: SearchHistory = {};

	// Get current state synchronously
	searchHistory.subscribe(history => currentHistory = history)();

	const entries = Object.values(currentHistory);

	if (entries.length === 0) {
		return DEFAULT_SUGGESTIONS;
	}

	// Calculate usage score (count * recency factor)
	const scored = entries.map(entry => {
		const daysSinceSearch = (Date.now() - entry.lastSearched) / (24 * 60 * 60 * 1000);
		const recencyFactor = Math.max(0.1, 1 - (daysSinceSearch / 30)); // Decay over 30 days
		const score = entry.count * recencyFactor;

		return { ...entry, score };
	});

	// Sort by score and extract locations (first part before comma)
	const popular = scored
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map(entry => {
			// Split by comma and take first non-empty part
			const parts = entry.location.split(',').map(part => part.trim()).filter(part => part.length > 0);
			return parts[0] || entry.location;
		});

	// Fill with defaults if needed
	const combined = [...popular];
	for (const defaultSuggestion of DEFAULT_SUGGESTIONS) {
		if (combined.length >= limit) break;
		if (!combined.includes(defaultSuggestion)) {
			combined.push(defaultSuggestion);
		}
	}

	return combined.slice(0, limit);
}

// Clear all search history
export function clearSearchHistory(): void {
	searchHistory.set({});
}

// Get search stats for debugging
export function getSearchStats(): { totalSearches: number; uniqueLocations: number; mostSearched?: SearchHistoryEntry } {
	let currentHistory: SearchHistory = {};
	searchHistory.subscribe(history => currentHistory = history)();

	const entries = Object.values(currentHistory);
	const totalSearches = entries.reduce((sum, entry) => sum + entry.count, 0);
	const uniqueLocations = entries.length;
	const mostSearched = entries.sort((a, b) => b.count - a.count)[0];

	return {
		totalSearches,
		uniqueLocations,
		mostSearched
	};
}