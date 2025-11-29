// Safe markdown parser that only supports bold and italic
export function parseMarkdown(text: string): string {
	// First, escape any existing HTML tags to prevent injection
	const escaped = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;');

	// Then apply markdown formatting
	return (
		escaped
			// Bold: **text** or __text__
			.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
			.replace(/__([^_]+)__/g, '<strong>$1</strong>')
			// Italic: *text* or _text_
			.replace(/\*([^*]+)\*/g, '<em>$1</em>')
			.replace(/_([^_]+)_/g, '<em>$1</em>')
	);
}
