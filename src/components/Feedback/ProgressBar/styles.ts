import { styled } from '@/styles';
import * as Progress from '@radix-ui/react-progress';

export const Container = styled('div', {
	display: 'flex',
	flexDirection: 'column',
	width: '100%',

	background: '$indigo100',

	borderRadius: 8,

	padding: '.2rem 1rem',
});

export const Title = styled('div', {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',

	span: {
		fontSize: 13,
		fontWeight: 'bold',
		color: '$textColorSecondary',
	},

	button: {
		all: 'unset',
		color: '$gray700',
		cursor: 'pointer',
	},

	'button:hover': {
		color: '$gray900',
	},
});

export const ProgressGroup = styled('div', {
	display: 'flex',
	alignItems: 'center',
	width: '100%',
	gap: 8,

	svg: {
		color: '$green500',
	},
});

export const ProgressRoot = styled(Progress.Root, {
	position: 'relative',
	overflow: 'hidden',
	background: '$gray100',
	borderRadius: '99999px',
	width: '100%',
	height: 12,

	transform: 'translateZ(0)',
});

export const ProgressIndicator = styled(Progress.Indicator, {
	background: '$indigo500',
	width: '100%',
	height: '100%',
	transition: 'transform 660ms cubic-bezier(0.65, 0, 0.35, 1)',
});
