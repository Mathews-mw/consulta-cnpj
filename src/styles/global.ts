import { globalCss } from '.';

export const globalStyles = globalCss({
	'*': {
		margin: 0,
		padding: 0,
	},

	body: {
		'-webkit-font-smoothing': 'antialised',
		backgroundColor: '$surfaceground',
		color: '$textColor',
		boxSizing: 'border-box',
	},

	'body, input, textarea, button': {
		fontFamily: "'Poppins', sans-serif",
		fontWeight: 400,
	},

	'h1, h2, h3, h4': {
		color: '$bluegray900',
	},

	h1: {
		fontWeight: 500,
		fontSize: 24,
	},
});
