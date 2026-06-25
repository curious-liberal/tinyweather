// Shared configuration for AI model requests via OpenRouter.

export const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

// Fallback model used when the relevant env var is not configured.
// OpenRouter routes this to one of its upstream providers automatically.
export const DEFAULT_AI_MODEL = 'meta-llama/llama-3.1-8b-instruct';
