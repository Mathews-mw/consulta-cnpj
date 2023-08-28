import { styled } from '@stitches/react';

export const CompanyInfosContainer = styled('div', {
	display: 'flex',
	flexDirection: 'column',

	'.p-accordion .p-accordion-header': {
		border: 'none',

		a: {
			border: 'none',
			background: 'none',
			padding: '1rem 0',
		},
	},

	'.p-accordion .p-accordion-content': {
		border: 'none',
		padding: 0,
		margin: 0,
		lineHeight: '180%',
	},
});
