import { styled } from '@/styles';

export const Container = styled('div', {
	display: 'flex',
	flexDirection: 'column',
	gap: '1rem',
});

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

export const FileContainer = styled('div', {
	border: '1px solid $indigo100',
});

export const ButtonsContainer = styled('div', {
	display: 'flex',
	justifyContent: 'space-between',
	gap: '1rem',
	padding: '1rem',
	borderBottom: '1px solid $indigo100',

	'.btns-group': {
		display: 'flex',
		gap: '1rem',
	},
});

export const UploadStatusContainer = styled('div', {
	display: 'flex',
	flexDirection: 'column',

	'.group': {
		display: 'flex',
		justifyContent: 'end',
		alignItems: 'center',
	},
});

export const FileInfosContainer = styled('div', {
	display: 'flex',
	padding: '1rem',
	alignItems: 'center',

	svg: {
		width: '3.25rem',
		height: '4.5rem',
	},

	'.infos': {
		display: 'flex',
		flexDirection: 'column',
		fontSize: 14,
	},
});

export const ButtonUpload = styled('label', {
	backgroundColor: '$indigo500',
	color: '$gray100',
	padding: 10,
	borderRadius: 6,
	cursor: 'pointer',

	display: 'inline-flex',
	gap: 8,
	alignItems: 'center',

	'&:hover': {
		backgroundColor: '$indigo600',
	},

	'&:disabled': {
		cursor: 'not-allowed',
	},
});

export const FileStatusTag = styled('span', {
	color: '$gray100',
	borderRadius: 8,

	padding: '4px 6px',
	marginLeft: 6,

	fontSize: 12,
	fontWeight: 'bold',

	variants: {
		severity: {
			pending: {
				backgroundColor: '$yellow500',
			},
			sucess: {
				backgroundColor: '$green500',
			},
			processing: {
				backgroundColor: '$blue500',
			},
		},
	},
});

export const OverlayContent = styled('div', {
	display: 'flex',
	maxWidth: '20rem',

	lineHeight: 1.4,
});
