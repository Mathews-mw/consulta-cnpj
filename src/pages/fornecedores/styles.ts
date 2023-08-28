import { styled } from '@/styles';

export const Container = styled('div', {});

export const TitleContainer = styled('div', {
	display: 'flex',
	justifyContent: 'space-between',

	width: '100%',
	marginBottom: '1rem',

	'.p-progress-spinner': {
		display: 'flex',
		width: '50px',
		height: '50px',
		margin: 0,
	},
});

export const SearchContainer = styled('div', {
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'end',
	gap: '1rem',
	marginBottom: '1rem',

	'.p-chip': {
		fontSize: 10,
		marginRight: 5,
	},
});

export const LabelGroup = styled('div', {
	display: 'flex',
	flexDirection: 'column',
	gap: 6,

	'input::placeholder': {
		color: '$gray400',
	},

	'.p-chip:hover': {
		background: '$indigo200',
	},

	'.p-chip.active': {
		background: '$indigo400',
		color: '$gray100',
		fontWeight: 700,
	},
});

export const ProgressContainer = styled('div', {
	display: 'flex',
	position: 'relative',
	width: '100%',

	marginBottom: '1rem',
});

export const TableContainer = styled('div', {});

export const SituationCellContainer = styled('div', {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
});

export const ActionsButtonsContainer = styled('div', {
	display: 'flex',
	gap: 5,
});

export const ContextComponentContaier = styled('div', {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',

	width: '100%',
});
