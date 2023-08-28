import { styled } from '../../styles';

export const HomeContainer = styled('div', {
	display: 'flex',
	flexDirection: 'column',
	gap: '1rem',
});

export const SearchContainer = styled('div', {
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'end',
	gap: '1rem',
});

export const LabelGroup = styled('div', {
	display: 'flex',
	flexDirection: 'column',
	gap: 2,

	'input::placeholder': {
		color: '$gray400',
	},
});

export const InfoAlert = styled('div', {
	marginTop: '1rem',
});

export const CompanyContainer = styled('div', {
	display: 'grid',
	gridTemplateColumns: '1fr 1fr',

	lineHeight: '180%',

	border: '1px solid $bluegray100',
	borderRadius: 6,
});

export const CompanyInfosContainer = styled('div', {
	display: 'flex',
	flexDirection: 'column',

	padding: '1rem',
	borderRight: '1px solid $bluegray100',
});

export const CompanyFormContainer = styled('div', {
	padding: '1rem',
	borderLeft: '1px solid $bluegray100',
});
