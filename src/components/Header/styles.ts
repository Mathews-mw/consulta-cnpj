import { styled } from '../../styles';

export const HeaderContainer = styled('header', {
	display: 'flex',
	width: '100%',
	maxHeight: '5rem',
	height: '5rem',
	justifyContent: 'space-between',
	alignItems: 'center',

	padding: '0 2rem',
	borderRadius: 6,

	backgroundColor: '$surfacecard',
	boxShadow: '0 3px 5px rgb(0 0 0 / 2%), 0 0 2px rgb(0 0 0 / 5%), 0 1px 4px rgb(0 0 0 / 8%)',
});

export const LogoContainer = styled('div', {
	objectFit: 'contain',
	borderBottom: 'solid 2px transparent',

	cursor: 'pointer',

	img: {
		width: 48,
		height: 36,
	},

	a: {
		textDecoration: 'none',
	},

	'&:hover': {
		borderBottom: 'solid 2px $indigo500',
	},
});

export const Logo = styled('span', {
	color: '$primary500',
	fontWeight: 'bold',
	fontSize: 18,
});

export const NavContainer = styled('div', {
	display: 'flex',
	gap: '1rem',

	i: {
		color: '$textColorSecondary',
		borderBottom: 'solid 2px transparent',

		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: 36,
		height: 36,

		cursor: 'pointer',
	},

	'i:hover': {
		color: '$gray900',
		borderBottom: 'solid 2px $indigo500',
	},
});
