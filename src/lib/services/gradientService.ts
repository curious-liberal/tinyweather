import type { ProcessedWeatherData } from '$lib/types/weather';

export interface Gradient {
	background: string;
	accent: string;
	name: string;
}

export const weatherGradients: Record<string, Gradient> = {
	// Sunny & Clear
	clear: {
		background: 'linear-gradient(135deg, #87CEEB 0%, #FFE4B5 100%)',
		accent: '#87CEEB',
		name: 'Clear Sky'
	},
	sunny: {
		background: 'linear-gradient(135deg, #FFD700 0%, #FF6347 100%)',
		accent: '#FFD700',
		name: 'Sunny'
	},

	// Cloudy
	cloudy: {
		background: 'linear-gradient(135deg, #708090 0%, #2F4F4F 100%)',
		accent: '#708090',
		name: 'Cloudy'
	},
	partlyCloudy: {
		background: 'linear-gradient(135deg, #87CEFA 0%, #4682B4 100%)',
		accent: '#87CEFA',
		name: 'Partly Cloudy'
	},

	// Rainy
	rainy: {
		background: 'linear-gradient(135deg, #4682B4 0%, #191970 100%)',
		accent: '#4682B4',
		name: 'Rainy'
	},
	lightRain: {
		background: 'linear-gradient(135deg, #87CEEB 0%, #6495ED 100%)',
		accent: '#87CEEB',
		name: 'Light Rain'
	},
	heavyRain: {
		background: 'linear-gradient(135deg, #36454F 0%, #2C3E50 100%)',
		accent: '#36454F',
		name: 'Heavy Rain'
	},

	// Stormy
	stormy: {
		background: 'linear-gradient(135deg, #2C3E50 0%, #1C1C1C 100%)',
		accent: '#4B0082',
		name: 'Stormy'
	},

	// Snow
	snowy: {
		background: 'linear-gradient(135deg, #E6E6FA 0%, #B0C4DE 100%)',
		accent: '#E6E6FA',
		name: 'Snowy'
	},
	blizzard: {
		background: 'linear-gradient(135deg, #C0C0C0 0%, #708090 100%)',
		accent: '#C0C0C0',
		name: 'Blizzard'
	},

	// Special conditions
	foggy: {
		background: 'linear-gradient(135deg, #D3D3D3 0%, #A9A9A9 100%)',
		accent: '#D3D3D3',
		name: 'Foggy'
	},
	windy: {
		background: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)',
		accent: '#87CEEB',
		name: 'Windy'
	},

	// Time-based (fallback)
	dawn: {
		background: 'linear-gradient(135deg, #FFB347 0%, #FF69B4 100%)',
		accent: '#FFB347',
		name: 'Dawn'
	},
	dusk: {
		background: 'linear-gradient(135deg, #DDA0DD 0%, #9370DB 100%)',
		accent: '#DDA0DD',
		name: 'Dusk'
	},
	night: {
		background: 'linear-gradient(135deg, #191970 0%, #000080 100%)',
		accent: '#191970',
		name: 'Night'
	},

	// Default - much more appealing warm gradient
	default: {
		background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
		accent: '#FF6B6B',
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