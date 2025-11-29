import type { ProcessedWeatherData } from '$lib/types/weather';

export interface Gradient {
	background: string;
	accent: string;
	name: string;
}

export const weatherGradients: Record<string, Gradient> = {
	// Sunny & Clear
	clear: {
		background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		accent: '#667eea',
		name: 'Clear Sky'
	},
	sunny: {
		background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
		accent: '#fcb69f',
		name: 'Sunny'
	},

	// Cloudy
	cloudy: {
		background: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
		accent: '#34495e',
		name: 'Cloudy'
	},
	partlyCloudy: {
		background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
		accent: '#0984e3',
		name: 'Partly Cloudy'
	},

	// Rainy
	rainy: {
		background: 'linear-gradient(135deg, #2c3e50 0%, #3c6382 100%)',
		accent: '#3c6382',
		name: 'Rainy'
	},
	lightRain: {
		background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
		accent: '#0984e3',
		name: 'Light Rain'
	},
	heavyRain: {
		background: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
		accent: '#636e72',
		name: 'Heavy Rain'
	},

	// Stormy
	stormy: {
		background: 'linear-gradient(135deg, #2d3436 0%, #000000 100%)',
		accent: '#636e72',
		name: 'Stormy'
	},

	// Snow
	snowy: {
		background: 'linear-gradient(135deg, #ddd6f3 0%, #faaca8 100%)',
		accent: '#a29bfe',
		name: 'Snowy'
	},
	blizzard: {
		background: 'linear-gradient(135deg, #b2bec3 0%, #ddd6f3 100%)',
		accent: '#74b9ff',
		name: 'Blizzard'
	},

	// Special conditions
	foggy: {
		background: 'linear-gradient(135deg, #bdc3c7 0%, #ecf0f1 100%)',
		accent: '#95a5a6',
		name: 'Foggy'
	},
	windy: {
		background: 'linear-gradient(135deg, #81ecec 0%, #6c5ce7 100%)',
		accent: '#74b9ff',
		name: 'Windy'
	},

	// Time-based (fallback)
	dawn: {
		background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
		accent: '#e17055',
		name: 'Dawn'
	},
	dusk: {
		background: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
		accent: '#5f3dc4',
		name: 'Dusk'
	},
	night: {
		background: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
		accent: '#74b9ff',
		name: 'Night'
	},

	// Default
	default: {
		background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		accent: '#667eea',
		name: 'Weather'
	}
};

export function determineWeatherCondition(weatherData: ProcessedWeatherData): string {
	const { precipitation, clouds, wind, temperature, summaryHints } = weatherData;

	// Check for snow (if we had snow data)
	// if (snowfall > 0) return precipitation.maxChance > 70 ? 'blizzard' : 'snowy';

	// Check for precipitation
	if (precipitation.maxChance > 80) {
		return precipitation.totalRain > 10 ? 'heavyRain' : 'rainy';
	} else if (precipitation.maxChance > 40) {
		return 'lightRain';
	}

	// Check for storms (high wind + rain)
	if (wind.max > 15 && precipitation.maxChance > 60) {
		return 'stormy';
	}

	// Check for very windy conditions
	if (wind.max > 20) {
		return 'windy';
	}

	// Check cloud cover
	if (clouds.avg > 80) {
		return 'cloudy';
	} else if (clouds.avg > 40) {
		return 'partlyCloudy';
	}

	// Check for clear/sunny conditions
	if (clouds.avg < 20) {
		// Could enhance with time of day logic
		const hour = new Date().getHours();
		if (hour >= 5 && hour <= 7) return 'dawn';
		if (hour >= 18 && hour <= 20) return 'dusk';
		if (hour >= 21 || hour <= 5) return 'night';
		return 'sunny';
	}

	// Default based on summary hints
	if (summaryHints.includes('sunny periods')) return 'partlyCloudy';
	if (summaryHints.includes('likely rain')) return 'rainy';
	if (summaryHints.includes('windy')) return 'windy';

	return 'default';
}

export function getWeatherGradient(weatherData: ProcessedWeatherData): Gradient {
	const condition = determineWeatherCondition(weatherData);
	return weatherGradients[condition] || weatherGradients.default;
}

export function getGradientByCondition(condition: string): Gradient {
	return weatherGradients[condition] || weatherGradients.default;
}